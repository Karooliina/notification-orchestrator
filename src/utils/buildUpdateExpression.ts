import { mapExpressionAttributeValuesType } from './mapExpressionAttributeValuesType';

export function buildUpdateExpression(settings: Record<string, any>) {
  const dynamicUpdateExpression = [];
  const dynamicExpressionAttributeNames = {};
  const dynamicExpressionAttributeValues = {};

  dynamicUpdateExpression.push('#updatedAt = :updatedAt');
  dynamicExpressionAttributeNames['#updatedAt'] = 'updatedAt';
  dynamicExpressionAttributeValues[':updatedAt'] = { S: new Date().toISOString() };

  for (const [key, value] of Object.entries(settings)) {
    if (value !== undefined && value !== null) {
      dynamicUpdateExpression.push(`#${key} = :${key}`);
      dynamicExpressionAttributeNames[`#${key}`] = key;
      const valueType = mapExpressionAttributeValuesType(value);

      if (valueType === 'N') {
        dynamicExpressionAttributeValues[`:${key}`] = { N: String(value) };
      } else if (valueType === 'NS') {
        dynamicExpressionAttributeValues[`:${key}`] = { [valueType]: value.map(String) };
      } else {
        dynamicExpressionAttributeValues[`:${key}`] = { [valueType]: value };
      }
    }
  }

  return {
    updateExpression: `SET ${dynamicUpdateExpression.join(', ')}`,
    expressionAttributeNames: dynamicExpressionAttributeNames,
    expressionAttributeValues: dynamicExpressionAttributeValues,
  };
}
