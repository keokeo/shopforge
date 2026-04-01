import { Button, Table, Space, Tag, Input, message, Popconfirm } from 'antd';
import { PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import type { ColumnsType } from 'antd/es/table';
import { productsApi } from '../services/api';

interface Product {
  id: number;
  name: string;
  slug: string;
  main_image_url?: string;
  base_price: number;
  is_active: boolean;
  is_featured: boolean;
  created_at: string;
}

export default function Products() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const data: any = await productsApi.list({ page, page_size: 20, search: search || undefined, include_inactive: true });
      setProducts(data.items || []);
      setTotal(data.total || 0);
    } catch (err) {
      message.error('加载商品列表失败');
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleDelete = async (id: number) => {
    try {
      await productsApi.delete(id);
      message.success('删除成功');
      fetchProducts();
    } catch (err) {
      message.error('删除失败');
    }
  };

  const columns: ColumnsType<Product> = [
    { title: 'ID', dataIndex: 'id', width: 70 },
    {
      title: '图片',
      dataIndex: 'main_image_url',
      width: 70,
      render: (url: string) => {
        if (!url) {
          return (
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 6,
                background: '#f5f5f5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ccc',
                fontSize: 16,
              }}
            >
              📷
            </div>
          );
        }
        // Use thumbnail for faster list loading
        const thumbUrl = url.replace('/uploads/', '/uploads/thumbs/');
        return (
          <img
            src={thumbUrl}
            alt="商品"
            style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 6 }}
            onError={(e) => { (e.target as HTMLImageElement).src = url; }}
          />
        );
      },
    },
    { title: '商品名称', dataIndex: 'name', ellipsis: true },
    {
      title: '价格',
      dataIndex: 'base_price',
      width: 120,
      render: (price: number) => `¥${price.toFixed(2)}`,
    },
    {
      title: '状态',
      dataIndex: 'is_active',
      width: 100,
      render: (active: boolean) => (
        <Tag color={active ? 'green' : 'default'}>{active ? '上架' : '下架'}</Tag>
      ),
    },
    {
      title: '精选',
      dataIndex: 'is_featured',
      width: 100,
      render: (featured: boolean) => featured ? <Tag color="gold">精选</Tag> : '-',
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      width: 160,
      render: (date: string) => new Date(date).toLocaleString('zh-CN'),
    },
    {
      title: '操作',
      width: 200,
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => navigate(`/products/${record.id}/edit`)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除此商品吗？"
            description="删除后相关 SKU 也将一并删除"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="link" danger size="small" icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2>商品管理</h2>
        <Space>
          <Input.Search
            placeholder="搜索商品"
            prefix={<SearchOutlined />}
            style={{ width: 200 }}
            onSearch={(value) => { setSearch(value); setPage(1); }}
            allowClear
          />
          <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/products/new')}>
            新增商品
          </Button>
        </Space>
      </div>
      <Table
        columns={columns}
        dataSource={products}
        loading={loading}
        rowKey="id"
        pagination={{
          current: page,
          pageSize: 20,
          total,
          onChange: (p) => setPage(p),
          showTotal: (total) => `共 ${total} 条`,
        }}
        locale={{ emptyText: '暂无商品，点击「新增商品」开始添加' }}
      />
    </div>
  );
}
