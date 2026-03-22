"""
文件上传路由
"""
import os
import uuid
import aiofiles
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from core.config import get_settings
from core.dependencies import get_admin_user
from models.user import User

settings = get_settings()
router = APIRouter(prefix="/upload", tags=["文件上传"])

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".webp"}

@router.post("/image", response_model=dict)
async def upload_image(
    file: UploadFile = File(...),
    _admin: User = Depends(get_admin_user),
):
    """上传图片（仅管理员）"""
    ext = os.path.splitext(file.filename)[1].lower() if file.filename else ""
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail="不支持的图片格式")
        
    # 读取文件内容以检查大小
    content = await file.read()
    if len(content) > settings.MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="文件大小超过限制")
        
    # 生成唯一文件名
    filename = f"{uuid.uuid4().hex}{ext}"
    filepath = os.path.join(settings.UPLOAD_DIR, filename)
    
    # 异步保存文件
    async with aiofiles.open(filepath, "wb") as f:
        await f.write(content)
        
    return {"url": f"http://localhost:8000/uploads/{filename}"}
