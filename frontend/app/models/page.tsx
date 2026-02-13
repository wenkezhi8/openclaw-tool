'use client';

import { useState } from 'react';
import { useModels, useModelActions } from '@/hooks';
import { ModelsTable, ModelTestDialog, ModelConfigDialog } from '@/components/models';
import { HelpButton } from '@/components/common';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import type { Model, UpdateModelRequest, ModelTestRequest } from '@/types/model';
import { useI18n } from '@/hooks';

export default function ModelsPage() {
  const { t } = useI18n();
  const { data: models, isLoading } = useModels();
  const {
    deleteModel,
    updateModel,
    testModel,
    isDeleting,
    isUpdating,
    isTesting
  } = useModelActions();

  const [testingModel, setTestingModel] = useState<Model | null>(null);
  const [configuringModel, setConfiguringModel] = useState<Model | null>(null);
  const [isTestDialogOpen, setIsTestDialogOpen] = useState(false);
  const [isConfigDialogOpen, setIsConfigDialogOpen] = useState(false);

  const handleDelete = (model: Model) => {
    if (confirm(t('models.confirmDelete', `Are you sure you want to delete "${model.name}"?`).replace('{name}', model.name))) {
      deleteModel(model.id, {
        onSuccess: () => {
          toast.success(t('messages.deleteSuccess'));
        },
      });
    }
  };

  const handleToggle = (model: Model) => {
    updateModel({
      id: model.id,
      data: { enabled: !model.enabled },
    });
  };

  const handleTest = (model: Model) => {
    setTestingModel(model);
    setIsTestDialogOpen(true);
  };

  const handleConfigure = (model: Model) => {
    setConfiguringModel(model);
    setIsConfigDialogOpen(true);
  };

  const handleRunTest = async (request: ModelTestRequest) => {
    return await testModel(request);
  };

  const handleSaveConfig = (modelId: string, data: UpdateModelRequest) => {
    updateModel(
      { id: modelId, data },
      {
        onSuccess: () => {
          setIsConfigDialogOpen(false);
          setConfiguringModel(null);
          toast.success(t('messages.updateSuccess'));
        },
      }
    );
  };

  const handleCloseTestDialog = () => {
    setIsTestDialogOpen(false);
    setTestingModel(null);
  };

  const handleCloseConfigDialog = () => {
    setIsConfigDialogOpen(false);
    setConfiguringModel(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('models.title')}</h1>
          <p className="text-muted-foreground">
            {t('models.list')}
          </p>
        </div>
        <div className="flex gap-2">
          <HelpButton page="models" />
          <Button variant="outline" disabled>
            <Plus className="h-4 w-4 mr-2" />
            {t('models.add')}
          </Button>
        </div>
      </div>

      <ModelsTable
        models={models || []}
        onToggle={handleToggle}
        onDelete={handleDelete}
        onTest={handleTest}
        onConfigure={handleConfigure}
        text={{
          noModels: t('models.noModels'),
          name: t('models.name'),
          id: t('models.id'),
          channel: t('models.channel'),
          contextLength: t('models.contextLength'),
          pricing: t('models.pricing'),
          enabled: t('models.enabled'),
          actions: t('models.actions'),
          n_a: t('models.n_a'),
          in: t('models.in'),
          out: t('models.out'),
          delete: t('models.delete'),
          configure: t('models.configure'),
          test: t('models.test'),
        }}
      />

      <div className="rounded-lg border p-6 text-center">
        <p className="text-sm text-muted-foreground">
          {t('models.autoDiscovery')}
        </p>
      </div>

      <ModelTestDialog
        model={testingModel}
        open={isTestDialogOpen}
        onClose={handleCloseTestDialog}
        onTest={handleRunTest}
      />

      <ModelConfigDialog
        model={configuringModel}
        open={isConfigDialogOpen}
        onClose={handleCloseConfigDialog}
        onSave={handleSaveConfig}
        isLoading={isUpdating}
      />
    </div>
  );
}
