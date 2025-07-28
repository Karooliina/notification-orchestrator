export function mapExpressionAttributeValuesType(value: any) {
  switch (typeof value) {
    case 'string':
      return 'S';
    case 'number':
      return 'N';
    case 'boolean':
      return 'BOOL';
    case 'object':
      if (Array.isArray(value) && value.every((item) => typeof item === 'string')) return 'SS';
      if (Array.isArray(value) && value.every((item) => typeof item === 'number')) return 'NS';
    default:
      return 'S';
  }
}
