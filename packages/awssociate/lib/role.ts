
export function roleArn(accountId: string, roleName: string) {
  const safeRoleName = roleName.startsWith('/') ? roleName.substring(1) : roleName
  return `arn:aws:iam::${accountId}:role/${safeRoleName}`
}