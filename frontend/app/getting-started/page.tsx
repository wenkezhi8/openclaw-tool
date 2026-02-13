'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks';
import { useI18n } from '@/lib/i18n';
import { apiClient, API_ENDPOINTS } from '@/lib/api';
import {
  CheckCircle2,
  Circle,
  ChevronRight,
  ChevronLeft,
  Download,
  Bot,
  MessageSquare,
  TestTube,
  PartyPopper,
  Loader2,
  ExternalLink,
  Terminal,
} from 'lucide-react';

interface Step {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
}

export default function GettingStartedPage() {
  const { t } = useI18n();
  const router = useRouter();
  const { success, error } = useToast();

  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // Step states
  const [cliInstalled, setCliInstalled] = useState<boolean | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
  const [platformToken, setPlatformToken] = useState('');
  const [testResult, setTestResult] = useState<'pending' | 'success' | 'error'>('pending');

  const steps: Step[] = [
    {
      id: 1,
      title: t('gettingStarted.step1.title', '安装 CLI'),
      description: t('gettingStarted.step1.description', '检测 OpenClaw CLI 安装状态'),
      icon: <Download className="h-5 w-5" />,
    },
    {
      id: 2,
      title: t('gettingStarted.step2.title', '配置模型'),
      description: t('gettingStarted.step2.description', '设置 AI 模型提供商'),
      icon: <Bot className="h-5 w-5" />,
    },
    {
      id: 3,
      title: t('gettingStarted.step3.title', '连接平台'),
      description: t('gettingStarted.step3.description', '选择要连接的消息平台'),
      icon: <MessageSquare className="h-5 w-5" />,
    },
    {
      id: 4,
      title: t('gettingStarted.step4.title', '测试连接'),
      description: t('gettingStarted.step4.description', '验证配置是否正确'),
      icon: <TestTube className="h-5 w-5" />,
    },
    {
      id: 5,
      title: t('gettingStarted.step5.title', '完成'),
      description: t('gettingStarted.step5.description', '开始使用 OpenClaw'),
      icon: <PartyPopper className="h-5 w-5" />,
    },
  ];

  // Check CLI installation on mount
  useEffect(() => {
    checkCliInstallation();
  }, []);

  const checkCliInstallation = async () => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.INSTALL_STATUS);
      setCliInstalled(response.data?.installed ?? false);
    } catch {
      setCliInstalled(false);
    }
  };

  const installCli = async () => {
    setIsLoading(true);
    try {
      await apiClient.post(API_ENDPOINTS.INSTALL);
      await checkCliInstallation();
      success(t('gettingStarted.installSuccess', 'CLI 安装成功'));
    } catch {
      error(t('gettingStarted.installError', 'CLI 安装失败'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleNext = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFinish = () => {
    router.push('/');
  };

  const runTest = async () => {
    setIsLoading(true);
    setTestResult('pending');
    try {
      // Test gateway status
      const response = await apiClient.get(API_ENDPOINTS.GATEWAY_STATUS);
      if (response.data?.status === 'running') {
        setTestResult('success');
        success(t('gettingStarted.testSuccess', '连接测试成功'));
      } else {
        setTestResult('error');
      }
    } catch {
      setTestResult('error');
      error(t('gettingStarted.testError', '连接测试失败'));
    } finally {
      setIsLoading(false);
    }
  };

  const providers = [
    { id: 'openai', name: 'OpenAI', url: 'https://platform.openai.com/api-keys' },
    { id: 'anthropic', name: 'Anthropic', url: 'https://console.anthropic.com/settings/keys' },
    { id: 'glm', name: 'GLM (智谱)', url: 'https://open.bigmodel.cn/api-keys' },
    { id: 'google', name: 'Google AI', url: 'https://aistudio.google.com/apikey' },
  ];

  const platforms = [
    { id: 'telegram', name: 'Telegram', icon: '📱' },
    { id: 'discord', name: 'Discord', icon: '💬' },
    { id: 'whatsapp', name: 'WhatsApp', icon: '📲' },
    { id: 'wechat', name: '微信', icon: '💚' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">
            {t('gettingStarted.title', '欢迎使用 OpenClaw')}
          </h1>
          <p className="text-muted-foreground">
            {t('gettingStarted.subtitle', '按照以下步骤快速完成配置')}
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors ${
                  currentStep >= step.id
                    ? 'bg-primary border-primary text-primary-foreground'
                    : 'border-muted-foreground/30 text-muted-foreground'
                }`}
              >
                {currentStep > step.id ? (
                  <CheckCircle2 className="h-5 w-5" />
                ) : (
                  step.icon
                )}
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`w-16 h-0.5 mx-2 ${
                    currentStep > step.id ? 'bg-primary' : 'bg-muted-foreground/30'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {steps[currentStep - 1].icon}
              {steps[currentStep - 1].title}
            </CardTitle>
            <CardDescription>{steps[currentStep - 1].description}</CardDescription>
          </CardHeader>
          <CardContent className="min-h-[300px]">
            {/* Step 1: CLI Installation */}
            {currentStep === 1 && (
              <div className="space-y-6">
                {cliInstalled === null ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : cliInstalled ? (
                  <div className="text-center py-8">
                    <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">
                      {t('gettingStarted.cliInstalled', 'CLI 已安装')}
                    </h3>
                    <p className="text-muted-foreground">
                      {t('gettingStarted.cliInstalledDesc', 'OpenClaw CLI 已正确安装，可以继续下一步')}
                    </p>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Terminal className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">
                      {t('gettingStarted.cliNotInstalled', 'CLI 未安装')}
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      {t('gettingStarted.cliNotInstalledDesc', '点击下方按钮自动安装 OpenClaw CLI')}
                    </p>
                    <Button onClick={installCli} disabled={isLoading}>
                      {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <Download className="h-4 w-4 mr-2" />
                      )}
                      {t('gettingStarted.installCli', '安装 CLI')}
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Step 2: Model Provider */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  {providers.map((provider) => (
                    <Card
                      key={provider.id}
                      className={`cursor-pointer transition-all hover:border-primary ${
                        selectedProvider === provider.id ? 'border-primary bg-primary/5' : ''
                      }`}
                      onClick={() => setSelectedProvider(provider.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{provider.name}</span>
                          {selectedProvider === provider.id && (
                            <CheckCircle2 className="h-5 w-5 text-primary" />
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {selectedProvider && (
                  <div className="space-y-4 mt-6">
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <a
                          href={providers.find((p) => p.id === selectedProvider)?.url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          {t('gettingStarted.getApiKey', '获取 API Key')}
                        </a>
                      </Button>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="apiKey">API Key</Label>
                      <Input
                        id="apiKey"
                        type="password"
                        placeholder="sk-..."
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Platform Connection */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  {platforms.map((platform) => (
                    <Card
                      key={platform.id}
                      className={`cursor-pointer transition-all hover:border-primary ${
                        selectedPlatform === platform.id ? 'border-primary bg-primary/5' : ''
                      }`}
                      onClick={() => setSelectedPlatform(platform.id)}
                    >
                      <CardContent className="p-4 text-center">
                        <span className="text-3xl mb-2 block">{platform.icon}</span>
                        <span className="font-medium">{platform.name}</span>
                        {selectedPlatform === platform.id && (
                          <CheckCircle2 className="h-5 w-5 text-primary mx-auto mt-2" />
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {selectedPlatform && (
                  <div className="space-y-4 mt-6 p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      {selectedPlatform === 'telegram' && '在 Telegram 中搜索 @BotFather，发送 /newbot 创建机器人，获取 Token'}
                      {selectedPlatform === 'discord' && '访问 Discord Developer Portal 创建 Bot，获取 Token'}
                      {selectedPlatform === 'whatsapp' && '扫描二维码连接 WhatsApp'}
                      {selectedPlatform === 'wechat' && '使用微信扫码登录'}
                    </p>
                    <div className="space-y-2">
                      <Label htmlFor="platformToken">Token</Label>
                      <Input
                        id="platformToken"
                        type="password"
                        placeholder="Enter token..."
                        value={platformToken}
                        onChange={(e) => setPlatformToken(e.target.value)}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 4: Test Connection */}
            {currentStep === 4 && (
              <div className="text-center py-8">
                {testResult === 'pending' && (
                  <>
                    <TestTube className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">
                      {t('gettingStarted.testConnection', '测试连接')}
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      {t('gettingStarted.testConnectionDesc', '点击下方按钮验证配置')}
                    </p>
                    <Button onClick={runTest} disabled={isLoading}>
                      {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <TestTube className="h-4 w-4 mr-2" />
                      )}
                      {t('gettingStarted.runTest', '运行测试')}
                    </Button>
                  </>
                )}
                {testResult === 'success' && (
                  <>
                    <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">
                      {t('gettingStarted.testSuccess', '测试通过')}
                    </h3>
                    <p className="text-muted-foreground">
                      {t('gettingStarted.testSuccessDesc', '所有配置正确，可以开始使用了')}
                    </p>
                  </>
                )}
                {testResult === 'error' && (
                  <>
                    <Circle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">
                      {t('gettingStarted.testFailed', '测试失败')}
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      {t('gettingStarted.testFailedDesc', '请检查配置后重试')}
                    </p>
                    <Button onClick={runTest} disabled={isLoading}>
                      {t('gettingStarted.retry', '重试')}
                    </Button>
                  </>
                )}
              </div>
            )}

            {/* Step 5: Complete */}
            {currentStep === 5 && (
              <div className="text-center py-8">
                <PartyPopper className="h-16 w-16 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">
                  {t('gettingStarted.congratulations', '恭喜！')}
                </h3>
                <p className="text-muted-foreground mb-6">
                  {t('gettingStarted.completeDesc', '你已完成所有配置，现在可以开始使用 OpenClaw 了')}
                </p>
                <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
                  <Button variant="outline" onClick={() => router.push('/gateway')}>
                    {t('gettingStarted.goToGateway', '网关管理')}
                  </Button>
                  <Button onClick={handleFinish}>
                    {t('gettingStarted.goToDashboard', '进入仪表板')}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation Buttons */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 1}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            {t('common.previous', '上一步')}
          </Button>
          {currentStep < 5 ? (
            <Button
              onClick={handleNext}
              disabled={
                (currentStep === 1 && !cliInstalled) ||
                (currentStep === 2 && !selectedProvider) ||
                (currentStep === 3 && !selectedPlatform) ||
                (currentStep === 4 && testResult !== 'success')
              }
            >
              {t('common.next', '下一步')}
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
