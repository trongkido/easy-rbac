import React, { useState, useMemo } from 'react';
import { GeneratorFormData, TargetAPI, AccessType, OutputOsType } from '../types';
import { TARGET_API_OPTIONS, ACCESS_TYPE_OPTIONS, OUTPUT_OS_TYPE_OPTIONS } from '../constants';
import Card from './ui/Card';
import Input from './ui/Input';
import Select from './ui/Select';
import Button from './ui/Button';

interface GeneratorFormProps {
  onGenerate: (formData: GeneratorFormData) => void;
  isLoading: boolean;
}

const GeneratorForm: React.FC<GeneratorFormProps> = ({ onGenerate, isLoading }) => {
  const [formData, setFormData] = useState<GeneratorFormData>({
    targetApi: TargetAPI.KUBERNETES,
    accessType: AccessType.SERVICE_ACCOUNT,
    principalName: 'temp-user-01',
    requiredPermissions: 'pods/get, namespaces/list',
    durationHours: 1,
    outputOsType: OutputOsType.BASH,
    targetEnvironment: 'staging-cluster',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTargetApiChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newTargetApi = e.target.value as TargetAPI;
    const newAccessTypeOptions = ACCESS_TYPE_OPTIONS[newTargetApi];
    setFormData(prev => ({
        ...prev,
        targetApi: newTargetApi,
        accessType: newAccessTypeOptions[0].value, // Default to the first available access type
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGenerate(formData);
  };

  const currentAccessTypeOptions = useMemo(() => {
    return ACCESS_TYPE_OPTIONS[formData.targetApi] || [];
  }, [formData.targetApi]);

  return (
    <Card className="h-full">
      <form onSubmit={handleSubmit} className="space-y-6">
        <h2 className="text-xl font-bold text-brand-text-primary">Access Request Details</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Select
            label="Target API"
            id="targetApi"
            name="targetApi"
            value={formData.targetApi}
            onChange={handleTargetApiChange}
            options={TARGET_API_OPTIONS}
          />
          <Select
            label="Access Type"
            id="accessType"
            name="accessType"
            value={formData.accessType}
            onChange={handleInputChange}
            options={currentAccessTypeOptions}
          />
        </div>

        <Input
          label="Principal Name"
          id="principalName"
          name="principalName"
          type="text"
          value={formData.principalName}
          onChange={handleInputChange}
          required
        />

        <Input
          label="Required Permissions (comma-separated)"
          id="requiredPermissions"
          name="requiredPermissions"
          type="text"
          value={formData.requiredPermissions}
          onChange={handleInputChange}
          required
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="Duration (Hours)"
            id="durationHours"
            name="durationHours"
            type="number"
            value={formData.durationHours}
            onChange={handleInputChange}
            min="1"
            max="24"
            required
          />
          <Select
            label="Output OS / Shell"
            id="outputOsType"
            name="outputOsType"
            value={formData.outputOsType}
            onChange={handleInputChange}
            options={OUTPUT_OS_TYPE_OPTIONS}
          />
        </div>

        <Input
          label="Target Environment (e.g., cluster name, region)"
          id="targetEnvironment"
          name="targetEnvironment"
          type="text"
          value={formData.targetEnvironment}
          onChange={handleInputChange}
          required
        />

        <div className="pt-4">
          <Button type="submit" isLoading={isLoading} className="w-full">
            Generate Script
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default GeneratorForm;