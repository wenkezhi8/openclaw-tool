'use client';

import { useState } from 'react';
import { useModels, useModelActions } from '@/hooks';
import { ModelsTable, ModelTestDialog, ModelConfigDialog } from '@/components/models';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import type { Model, UpdateModelRequest, ModelTestRequest } from '@/types/model';

export default function ModelsPage() {
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
    if (confirm(`Are you sure you want to delete "${model.name}"?`, '')) {
      deleteModel(model.id, {
        onSuccess: () => {
          toast.success('Model deleted successfully');
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
          toast.success('Model configuration updated');
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
          <h1 className="text-3xl font-bold tracking-tight">Models</h1>
          <p className="text-muted-foreground">
            Available AI models from configured channels
          </p>
        </div>
        <Button variant="outline" disabled>
          <Plus className="h-4 w-4 mr-2" />
          Add Model
        </Button>
      </div>

      <ModelsTable
        models={models || []}
        onToggle={handleToggle}
        onDelete={handleDelete}
        onTest={handleTest}
        onConfigure={handleConfigure}
      />

      <div className="rounded-lg border p-6 text-center">
        <p className="text-sm text-muted-foreground">
          Models are automatically discovered from configured channels.
          Add channels to see available models here.
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
