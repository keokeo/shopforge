import { Card, Form, Input, InputNumber, Switch, Select, Button, Space, Divider, message, Spin, Upload } from 'antd';
import { LoadingOutlined, PlusOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { productsApi, categoriesApi, uploadApi } from '../services/api';

const { TextArea } = Input;

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
        })
        .catch(() => message.error('加载商品信息失败'))
        .finally(() => setLoading(false));
    }
  }, [id, isEdit, form]);

  const onFinish = async (values: any) => {
    setSubmitting(true);
    try {
      if (isEdit) {
        await productsApi.update(Number(id), values);
        message.success('更新成功');
      } else {
        await productsApi.create(values);
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

  const handleUpload = async (options: any) => {
    const { file, onSuccess, onError } = options;
    setUploadingImage(true);
    try {
      const res: any = await uploadApi.image(file);
      setImageUrl(res.url);
      form.setFieldValue('main_image_url', res.url);
      onSuccess?.(res);
      message.success('上传成功');
    } catch (err) {
      onError?.(err as any);
      message.error('上传失败');
    } finally {
      setUploadingImage(false);
    }
  };

  const uploadButton = (
    <div>
      {uploadingImage ? <LoadingOutlined /> : <PlusOutlined />}
      <div style={{ marginTop: 8 }}>上传图片</div>
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
