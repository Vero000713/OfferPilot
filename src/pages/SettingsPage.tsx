import { Button, Card, Form, Input, message, Typography } from 'antd'
import { useSettingsStore } from '../store/settingsStore'

interface SettingsFormValues {
  apiKey: string
  model: string
}

export function SettingsPage() {
  const { apiKey, model, setApiKey, setModel } = useSettingsStore()

  function handleSave(values: SettingsFormValues) {
    setApiKey(values.apiKey.trim())
    setModel(values.model.trim() || 'deepseek-chat')
    message.success('已保存')
  }

  return (
    <div className="max-w-md space-y-4">
      <h2 className="text-lg font-semibold">设置</h2>
      <Card>
        <Typography.Text type="secondary">
          面试解析使用 DeepSeek API，Key 仅保存在本地浏览器中，不会上传到任何服务器。
        </Typography.Text>
        <Form
          layout="vertical"
          className="mt-4"
          initialValues={{ apiKey, model }}
          onFinish={handleSave}
        >
          <Form.Item name="apiKey" label="DeepSeek API Key">
            <Input.Password placeholder="sk-..." />
          </Form.Item>
          <Form.Item name="model" label="模型">
            <Input />
          </Form.Item>
          <Button type="primary" htmlType="submit">
            保存
          </Button>
        </Form>
      </Card>
    </div>
  )
}
