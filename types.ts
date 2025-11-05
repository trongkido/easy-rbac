
export enum TargetAPI {
  KUBERNETES = 'Kubernetes RBAC',
  AWS_IAM = 'AWS IAM',
  HASHICORP_VAULT = 'HashiCorp Vault',
  AZURE_AD = 'Azure AD',
}

export enum AccessType {
  USER = 'User',
  ROLE = 'Role',
  SERVICE_ACCOUNT = 'Service_Account',
}

export enum OutputOsType {
    BASH = 'Bash (Linux/macOS)',
    POWERSHELL = 'PowerShell (Windows)',
}


export interface GeneratorFormData {
  targetApi: TargetAPI;
  accessType: AccessType;
  principalName: string;
  requiredPermissions: string;
  durationHours: number;
  outputOsType: OutputOsType;
  targetEnvironment: string;
}
