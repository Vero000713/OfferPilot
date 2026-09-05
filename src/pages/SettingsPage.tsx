import { useState } from 'react'
import { useSettingsStore } from '../store/settingsStore'

export function SettingsPage() {
  const { apiKey, model, setApiKey, setModel } = useSettingsStore()
  const [localKey, setLocalKey] = useState(apiKey)
  const [localModel, setLocalModel] = useState(model)
  const [saved, setSaved] = useState(false)

  function handleSave() {
    setApiKey(localKey.trim())
    setModel(localModel.trim() || 'deepseek-chat')
    setSaved(true)
    setTimeout(() => setSaved(false), 1500)
  }

  return (
    <div className="max-w-md space-y-4">
      <h2 className="text-lg font-semibold">设置</h2>
      <div className="glass-card p-5 space-y-4">
        <p className="text-sm text-slate-500">
          面试解析使用 DeepSeek API，Key 仅保存在本地浏览器中，不会上传到任何服务器。
        </p>
        <div className="space-y-1">
          <label className="text-sm font-medium">DeepSeek API Key</label>
          <input
            type="password"
            className="input w-full"
            placeholder="sk-..."
            value={localKey}
            onChange={(e) => setLocalKey(e.target.value)}
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">模型</label>
          <input
            className="input w-full"
            value={localModel}
            onChange={(e) => setLocalModel(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-3">
          <button type="button" className="btn-primary" onClick={handleSave}>
            保存
          </button>
          {saved && <span className="text-sm text-emerald-600">已保存</span>}
        </div>
      </div>
    </div>
  )
}
