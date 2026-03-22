import { useState } from 'react';
import { Card, Form, Input, Button, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Login() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      // Backend expects application/x-www-form-urlencoded for OAuth2 password flow
      const formData = new URLSearchParams();
      formData.append('username', values.username);
      formData.append('password', values.password);

      const res = await axios.post('http://localhost:8000/api/v1/auth/login', formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });

      if (res.data && res.data.access_token) {
        localStorage.setItem('admin_token', res.data.access_token);
        message.success('登录成功');
        navigate('/');
      }
    } catch (err: any) {
      if (err.response?.status === 401) {
        message.error('账号或密码错误');
      } else {
        message.error('登录失败，请稍后重试');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      height: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      background: '#f3f4f6',
    }}>
      <Card style={{ width: 400, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <h1 style={{ fontSize: 24, fontWeight: 'bold', color: '#111827' }}>ShopForge Admin</h1>
          <p style={{ color: '#6b7280', marginTop: 8 }}>请输入账号密码以登录管理后台</p>
        </div>

        <Form
          name="login"
          initialValues={{ remember: true }}
          onFinish={onFinish}
          size="large"
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: '请输入用户名或邮箱！' }]}
          >
            <Input prefix={<UserOutlined style={{ color: '#9ca3af' }} />} placeholder="用户名/邮箱" />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: '请输入密码！' }]}
          >
            <Input.Password prefix={<LockOutlined style={{ color: '#9ca3af' }} />} placeholder="密码" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" style={{ width: '100%', background: '#4f46e5' }} loading={loading}>
              登录
            </Button>
          </Form.Item>
          
          <div style={{ textAlign: 'center', fontSize: 12, color: '#9ca3af' }}>
            <p>Admin 功能需要具备管理员权限的账号</p>
          </div>
        </Form>
      </Card>
    </div>
  );
}
