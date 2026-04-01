"""
文件上传路由 - 支持图片压缩、缩略图生成、批量上传、删除
"""
import os
import uuid
import aiofiles
from io import BytesIO
from PIL import Image as PILImage
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, Query
from core.config import get_settings
from core.dependencies import get_admin_user
from models.user import User

settings = get_settings()
router = APIRouter(prefix="/upload", tags=["文件上传"])

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".webp"}


def _process_image(content: bytes, ext: str) -> tuple[bytes, bytes]:
    """
    处理上传的图片：
    1. 大图压缩到最大边长 MAX_IMAGE_WIDTH (1920px)，质量 85%
    2. 生成缩略图 (300x300)
    返回 (压缩后原图bytes, 缩略图bytes)
    """
    img = PILImage.open(BytesIO(content))

    # 保留 EXIF 方向信息后转正
    from PIL import ImageOps
    img = ImageOps.exif_transpose(img)

    # 统一转为 RGB（处理 RGBA/P 等模式）
    if img.mode in ("RGBA", "P"):
        img = img.convert("RGB")

    # --- 压缩大图 ---
    max_w = settings.MAX_IMAGE_WIDTH
    if img.width > max_w or img.height > max_w:
        img.thumbnail((max_w, max_w), PILImage.LANCZOS)

    buf_main = BytesIO()
    save_format = "JPEG" if ext.lower() in (".jpg", ".jpeg") else "PNG" if ext.lower() == ".png" else "WEBP"
    if save_format == "JPEG":
        img.save(buf_main, format=save_format, quality=85, optimize=True)
    elif save_format == "WEBP":
        img.save(buf_main, format=save_format, quality=85)
    else:
        img.save(buf_main, format=save_format, optimize=True)
    main_bytes = buf_main.getvalue()

    # --- 缩略图 ---
    thumb_size = settings.THUMB_SIZE
    thumb = img.copy()
    thumb.thumbnail((thumb_size, thumb_size), PILImage.LANCZOS)
    buf_thumb = BytesIO()
    if save_format == "JPEG":
        thumb.save(buf_thumb, format="JPEG", quality=80, optimize=True)
    elif save_format == "WEBP":
        thumb.save(buf_thumb, format="WEBP", quality=80)
    else:
        thumb.save(buf_thumb, format="PNG", optimize=True)
    thumb_bytes = buf_thumb.getvalue()

    return main_bytes, thumb_bytes


async def _save_single_image(file: UploadFile) -> dict:
    """处理并保存单张图片，返回 url + thumbnail_url"""
    ext = os.path.splitext(file.filename)[1].lower() if file.filename else ""
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail=f"不支持的图片格式: {ext}")

    content = await file.read()
    if len(content) > settings.MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="文件大小超过限制 (最大 10MB)")

    # 对 GIF 不做压缩处理（可能是动图）
    if ext == ".gif":
        filename = f"{uuid.uuid4().hex}{ext}"
        filepath = os.path.join(settings.UPLOAD_DIR, filename)
        async with aiofiles.open(filepath, "wb") as f:
            await f.write(content)
        return {
            "url": f"http://localhost:8000/uploads/{filename}",
            "thumbnail_url": f"http://localhost:8000/uploads/{filename}",
            "filename": filename,
        }

    # 图片处理
    main_bytes, thumb_bytes = _process_image(content, ext)
    filename = f"{uuid.uuid4().hex}{ext}"
    filepath = os.path.join(settings.UPLOAD_DIR, filename)
    thumbpath = os.path.join(settings.THUMB_DIR, filename)

    async with aiofiles.open(filepath, "wb") as f:
        await f.write(main_bytes)
    async with aiofiles.open(thumbpath, "wb") as f:
        await f.write(thumb_bytes)

    return {
        "url": f"http://localhost:8000/uploads/{filename}",
        "thumbnail_url": f"http://localhost:8000/uploads/thumbs/{filename}",
        "filename": filename,
    }


@router.post("/image", response_model=dict)
async def upload_image(
    file: UploadFile = File(...),
    _admin: User = Depends(get_admin_user),
):
    """上传单张图片（仅管理员）- 自动压缩并生成缩略图"""
    return await _save_single_image(file)


@router.post("/images")
async def upload_images(
    files: list[UploadFile] = File(...),
    _admin: User = Depends(get_admin_user),
):
    """批量上传图片（仅管理员，最多 10 张）"""
    if len(files) > 10:
        raise HTTPException(status_code=400, detail="单次最多上传 10 张图片")

    results = []
    errors = []
    for i, file in enumerate(files):
        try:
            result = await _save_single_image(file)
            results.append(result)
        except HTTPException as e:
            errors.append({"index": i, "filename": file.filename, "error": e.detail})

    return {"uploaded": results, "errors": errors}


@router.delete("/image")
async def delete_image(
    filename: str = Query(..., description="要删除的文件名"),
    _admin: User = Depends(get_admin_user),
):
    """删除已上传的图片及其缩略图（仅管理员）"""
    # 安全校验：防止路径穿越
    if "/" in filename or "\\" in filename or ".." in filename:
        raise HTTPException(status_code=400, detail="无效的文件名")

    filepath = os.path.join(settings.UPLOAD_DIR, filename)
    thumbpath = os.path.join(settings.THUMB_DIR, filename)
    deleted = False

    if os.path.exists(filepath):
        os.remove(filepath)
        deleted = True
    if os.path.exists(thumbpath):
        os.remove(thumbpath)

    if not deleted:
        raise HTTPException(status_code=404, detail="文件不存在")

    return {"message": "删除成功", "filename": filename}
