import { Card, Form, Input, InputNumber, Switch, Select, Button, Space, Divider, message, Spin, Upload } from 'antd';
import { LoadingOutlined, PlusOutlined, DeleteOutlined, HolderOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { productsApi, categoriesApi, uploadApi } from '../services/api';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  horizontalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const { TextArea } = Input;

interface GalleryImage {
  uid: string;
  image_url: string;
  thumbnail_url?: string;
  alt_text: string;
  sort_order: number;
}

// --- Sortable gallery item component ---
function SortableGalleryItem({
  item,
  onRemove,
  onAltChange,
}: {
  item: GalleryImage;
  onRemove: () => void;
  onAltChange: (val: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.uid,
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    border: '1px solid #d9d9d9',
    borderRadius: 8,
    padding: 8,
    width: 140,
    flexShrink: 0,
    background: '#fff',
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <div style={{ position: 'relative', marginBottom: 6 }}>
        <img
          src={item.thumbnail_url || item.image_url}
          alt={item.alt_text || '商品图片'}
          style={{ width: '100%', height: 100, objectFit: 'cover', borderRadius: 6 }}
        />
        <div
          style={{
            position: 'absolute',
            top: 4,
            right: 4,
            display: 'flex',
            gap: 4,
          }}
        >
          <Button
            type="primary"
            danger
            size="small"
            icon={<DeleteOutlined />}
            onClick={onRemove}
            style={{ minWidth: 24, padding: '0 4px' }}
          />
        </div>
        <div
          {...listeners}
          style={{
            position: 'absolute',
            top: 4,
            left: 4,
            cursor: 'grab',
            background: 'rgba(0,0,0,0.4)',
            borderRadius: 4,
            padding: '2px 4px',
            color: '#fff',
            fontSize: 12,
          }}
        >
          <HolderOutlined />
        </div>
      </div>
      <Input
        size="small"
        placeholder="alt 描述"
        value={item.alt_text}
        onChange={(e) => onAltChange(e.target.value)}
        style={{ fontSize: 12 }}
      />
    </div>
  );
}

export default function ProductForm() {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageUrl, setImageUrl] = useState<string>('');

  // Gallery state
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
  const [uploadingGallery, setUploadingGallery] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  useEffect(() => {
    categoriesApi.list()
      .then((data: any) => setCategories(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (isEdit) {
      setLoading(true);
      productsApi.get(Number(id))
        .then((data: any) => {
          form.setFieldsValue(data);
          if (data.main_image_url) setImageUrl(data.main_image_url);
          // Load existing gallery images
          if (data.images && Array.isArray(data.images)) {
            setGalleryImages(
              data.images.map((img: any, i: number) => ({
                uid: `existing-${img.id || i}`,
                image_url: img.image_url,
                thumbnail_url: img.thumbnail_url,
                alt_text: img.alt_text || '',
                sort_order: img.sort_order ?? i,
              }))
            );
          }
        })
        .catch(() => message.error('加载商品信息失败'))
        .finally(() => setLoading(false));
    }
  }, [id, isEdit, form]);

  const onFinish = async (values: any) => {
    setSubmitting(true);
    try {
      // Attach gallery images
      const payload = {
        ...values,
        images: galleryImages.map((img, i) => ({
          image_url: img.image_url,
          alt_text: img.alt_text || null,
          sort_order: i,
        })),
      };

      if (isEdit) {
        await productsApi.update(Number(id), payload);
        message.success('更新成功');
      } else {
        await productsApi.create(payload);
        message.success('创建成功');
      }
      navigate('/products');
    } catch (err: any) {
      message.error(err?.response?.data?.detail || '操作失败');
    } finally {
      setSubmitting(false);
    }
  };

  // Auto-generate slug from name
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isEdit) {
      const slug = e.target.value
        .toLowerCase()
        .replace(/[\s]+/g, '-')
        .replace(/[^a-z0-9\u4e00-\u9fa5-]/g, '')
        .slice(0, 100);
      form.setFieldValue('slug', slug || '');
    }
  };

  // --- Main image upload ---
  const handleUpload = async (options: any) => {
    const { file, onSuccess, onError } = options;
    setUploadingImage(true);
    try {
      const res: any = await uploadApi.image(file);
      setImageUrl(res.url);
      form.setFieldValue('main_image_url', res.url);
      onSuccess?.(res);
      message.success('主图上传成功');
    } catch (err) {
      onError?.(err as any);
      message.error('上传失败');
    } finally {
      setUploadingImage(false);
    }
  };

  // --- Gallery image upload ---
  const handleGalleryUpload = async (options: any) => {
    const { file, onSuccess, onError } = options;
    setUploadingGallery(true);
    try {
      const res: any = await uploadApi.image(file);
      const newImage: GalleryImage = {
        uid: `new-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        image_url: res.url,
        thumbnail_url: res.thumbnail_url,
        alt_text: '',
        sort_order: galleryImages.length,
      };
      setGalleryImages((prev) => [...prev, newImage]);
      onSuccess?.(res);
    } catch (err) {
      onError?.(err as any);
      message.error('画廊图片上传失败');
    } finally {
      setUploadingGallery(false);
    }
  };

  // --- Gallery actions ---
  const handleGalleryRemove = (uid: string) => {
    setGalleryImages((prev) => prev.filter((img) => img.uid !== uid));
  };

  const handleGalleryAltChange = (uid: string, value: string) => {
    setGalleryImages((prev) =>
      prev.map((img) => (img.uid === uid ? { ...img, alt_text: value } : img))
    );
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setGalleryImages((prev) => {
      const oldIndex = prev.findIndex((item) => item.uid === active.id);
      const newIndex = prev.findIndex((item) => item.uid === over.id);
      return arrayMove(prev, oldIndex, newIndex);
    });
  };

  const uploadButton = (
    <div>
      {uploadingImage ? <LoadingOutlined /> : <PlusOutlined />}
      <div style={{ marginTop: 8 }}>上传主图</div>
    </div>
  );

  const galleryUploadButton = (
    <div
      style={{
        width: 140,
        height: 140,
        border: '1px dashed #d9d9d9',
        borderRadius: 8,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        color: '#999',
        flexShrink: 0,
      }}
    >
      {uploadingGallery ? <LoadingOutlined /> : <PlusOutlined />}
      <div style={{ marginTop: 8, fontSize: 12 }}>添加图片</div>
    </div>
  );

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 100 }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div>
      <h2 style={{ marginBottom: 24 }}>{isEdit ? '编辑商品' : '新增商品'}</h2>
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{ is_active: true, is_featured: false, base_price: 0, sort_order: 0 }}
        style={{ maxWidth: 800 }}
      >
        <Card title="基本信息" style={{ marginBottom: 16 }}>
          <Form.Item name="name" label="商品名称" rules={[{ required: true, message: '请输入商品名称' }]}>
            <Input placeholder="请输入商品名称" onChange={handleNameChange} />
          </Form.Item>
          <Form.Item name="slug" label="URL Slug" rules={[{ required: true, message: '请输入 URL slug' }]}>
            <Input placeholder="如: blue-t-shirt（自动从名称生成）" />
          </Form.Item>
          <Form.Item name="description" label="商品描述">
            <TextArea rows={4} placeholder="请输入商品描述" />
          </Form.Item>
          <Form.Item name="main_image_url" hidden>
            <Input />
          </Form.Item>
          <Form.Item label="主图">
            <Upload
              name="file"
              listType="picture-card"
              showUploadList={false}
              customRequest={handleUpload}
            >
              {imageUrl ? (
                <img src={imageUrl} alt="主图" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }} />
              ) : (
                uploadButton
              )}
            </Upload>
          </Form.Item>
          <Form.Item name="category_id" label="分类">
            <Select
              placeholder="请选择分类"
              allowClear
              options={categories.map((c) => ({ value: c.id, label: c.name }))}
            />
          </Form.Item>
        </Card>

        {/* Gallery Section */}
        <Card
          title="商品画廊"
          extra={<span style={{ color: '#999', fontSize: 12 }}>拖拽图片可调整顺序，最多 10 张</span>}
          style={{ marginBottom: 16 }}
        >
          <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 8 }}>
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext
                items={galleryImages.map((img) => img.uid)}
                strategy={horizontalListSortingStrategy}
              >
                {galleryImages.map((img) => (
                  <SortableGalleryItem
                    key={img.uid}
                    item={img}
                    onRemove={() => handleGalleryRemove(img.uid)}
                    onAltChange={(val) => handleGalleryAltChange(img.uid, val)}
                  />
                ))}
              </SortableContext>
            </DndContext>

            {galleryImages.length < 10 && (
              <Upload
                name="file"
                showUploadList={false}
                customRequest={handleGalleryUpload}
                accept="image/*"
              >
                {galleryUploadButton}
              </Upload>
            )}
          </div>
          {galleryImages.length === 0 && (
            <div style={{ color: '#bbb', fontSize: 13, marginTop: 8 }}>
              上传商品展示图片，在商品详情页中展示为画廊
            </div>
          )}
        </Card>

        <Card title="销售信息" style={{ marginBottom: 16 }}>
          <Form.Item name="base_price" label="基础价格" rules={[{ required: true }]}>
            <InputNumber min={0} precision={2} prefix="¥" style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="sort_order" label="排序权重">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Space size="large">
            <Form.Item name="is_active" label="是否上架" valuePropName="checked">
              <Switch />
            </Form.Item>
            <Form.Item name="is_featured" label="推荐精选" valuePropName="checked">
              <Switch />
            </Form.Item>
          </Space>
        </Card>

        <Divider />

        <Space>
          <Button type="primary" htmlType="submit" size="large" loading={submitting}>
            {isEdit ? '保存修改' : '创建商品'}
          </Button>
          <Button size="large" onClick={() => navigate('/products')}>取消</Button>
        </Space>
      </Form>
    </div>
  );
}
