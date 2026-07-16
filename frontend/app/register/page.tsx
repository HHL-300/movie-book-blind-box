'use client'
import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Form, Input, Button, Avatar, Card, message } from 'antd'
import { UserOutlined, LockOutlined, UploadOutlined, ArrowLeftOutlined } from '@ant-design/icons'
import request from '../../src/utils/request'

const DEFAULT_AVATAR = 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'

interface ApiRes<T = any> {
  code: number
  msg: string
  data?: T
}

interface RegisterFormValues {
  username: string
  password: string
  confirmPassword: string
}

export default function RegisterPage() {
  const [form] = Form.useForm<RegisterFormValues>()
  const [uploadedAvatar, setUploadedAvatar] = useState('')
  const [loading, setLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const handleAvatarUpload = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const validTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!validTypes.includes(file.type)) {
      message.error('仅支持jpg、png、webp格式图片')
      return
    }

    

    const reader = new FileReader()
    reader.onload = (event: ProgressEvent<FileReader>) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const maxSize = 200
        let width = img.width
        let height = img.height

        if (width > height) {
          if (width > maxSize) {
            height *= maxSize / width
            width = maxSize
          }
        } else {
          if (height > maxSize) {
            width *= maxSize / height
            height = maxSize
          }
        }

        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height)
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7)
          setUploadedAvatar(compressedDataUrl)
        }
      }
      const result = event.target?.result
      if (typeof result === 'string') {
        img.src = result
      }
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      const { username, password, confirmPassword } = values

      if (password !== confirmPassword) {
        message.error('两次输入的密码不一致')
        return
      }

      setLoading(true)

      const avatar = uploadedAvatar || DEFAULT_AVATAR

      const res: ApiRes<{ user_id: number; username: string; avatar: string }> = await request.post('/register', {
        username,
        password,
        avatar
      })

      if (res.code === 200) {
        message.success(res.msg)
        router.push('/')
      } else {
        message.error(res.msg)
      }

    } catch (err: any) {
      if (err.errorFields) {
        err.errorFields.forEach((field: { errors: string[]; name: string }) => {
          message.error(field.errors[0])
        })
      } else {
        message.error('注册失败，请稍后重试')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleBack = () => {
    router.push('/')
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <Card
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Button
              type="text"
              icon={<ArrowLeftOutlined />}
              onClick={handleBack}
              style={{ padding: 0 }}
            />
            用户注册
          </div>
        }
        style={{
          width: '100%',
          maxWidth: '420px',
          borderRadius: '12px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
        }}
      >
        <Form form={form} layout="vertical" size="large">
          <div style={{ marginBottom: '24px', textAlign: 'center' }}>
            <p style={{ color: '#666', fontSize: '14px', marginBottom: '12px' }}>选择头像</p>
            <Avatar
              src={uploadedAvatar || DEFAULT_AVATAR}
              size={90}
              style={{ cursor: 'pointer', border: '2px solid #6366F1' }}
              onClick={handleAvatarUpload}
              icon={<UploadOutlined />}
            />
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
            <p style={{ color: '#999', fontSize: '12px', marginTop: '10px' }}>
              点击头像可更换，仅支持jpg/png/webp
            </p>
          </div>

          <Form.Item
            name="username"
            label="用户名"
            rules={[
              { required: true, message: '用户名不能为空' },
              { max: 20, message: '用户名长度不能超过20个字符' },
              { pattern: /^[\u4e00-\u9fa5a-zA-Z0-9]+$/, message: '用户名只能包含中英文和数字' }
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="请输入用户名"
            />
          </Form.Item>

          <Form.Item
            name="password"
            label="密码"
            rules={[
              { required: true, message: '密码不能为空' },
              { min: 6, max: 20, message: '密码长度需在6-20个字符之间' },
              { pattern: /^(?=.*[a-zA-Z])(?=.*[0-9])/, message: '密码必须包含字母和数字' }
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="请输入密码"
            />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            label="确认密码"
            rules={[
              { required: true, message: '请确认密码' },
              ({ getFieldValue }) => ({
                validator(_: any, value: string | undefined) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve()
                  }
                  return Promise.reject(new Error('两次输入的密码不一致'))
                }
              })
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="请再次输入密码"
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0 }}>
            <Button
              type="primary"
              htmlType="button"
              onClick={handleSubmit}
              loading={loading}
              style={{ width: '100%', borderRadius: '8px', height: '44px', fontSize: '16px' }}
            >
              注册
            </Button>
          </Form.Item>

          <div style={{ textAlign: 'center', marginTop: '16px' }}>
            <Button type="text" onClick={handleBack}>
              已有账号？去登录
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  )
}