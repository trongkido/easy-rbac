
import { TargetAPI, AccessType, OutputOsType } from './types';

export const TARGET_API_OPTIONS = [
  { value: TargetAPI.KUBERNETES, label: 'Kubernetes RBAC' },
  { value: TargetAPI.AWS_IAM, label: 'AWS IAM' },
  { value: TargetAPI.HASHICORP_VAULT, label: 'HashiCorp Vault' },
  { value: TargetAPI.AZURE_AD, label: 'Azure AD' },
];

export const ACCESS_TYPE_OPTIONS: Record<TargetAPI, { value: AccessType, label: string }[]> = {
  [TargetAPI.KUBERNETES]: [
    { value: AccessType.SERVICE_ACCOUNT, label: 'Service Account' },
    { value: AccessType.USER, label: 'User' },
    { value: AccessType.ROLE, label: 'Role' },
  ],
  [TargetAPI.AWS_IAM]: [
    { value: AccessType.ROLE, label: 'Role' },
    { value: AccessType.USER, label: 'User' },
  ],
  [TargetAPI.HASHICORP_VAULT]: [
    { value: AccessType.ROLE, label: 'Role' },
    { value: AccessType.USER, label: 'User Pass Auth' },
  ],
  [TargetAPI.AZURE_AD]: [
    { value: AccessType.USER, label: 'User' },
    { value: AccessType.SERVICE_ACCOUNT, label: 'Service Principal' },
  ],
};


export const OUTPUT_OS_TYPE_OPTIONS = [
    { value: OutputOsType.BASH, label: 'Bash (Linux/macOS)'},
    { value: OutputOsType.POWERSHELL, label: 'PowerShell (Windows)'},
]
