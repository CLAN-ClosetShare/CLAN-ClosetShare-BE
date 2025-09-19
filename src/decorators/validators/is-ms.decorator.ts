import { registerDecorator, ValidationOptions } from 'class-validator';
import ms from 'ms';

export function IsMs(validatorOptions?: ValidationOptions): PropertyDecorator {
  return (object: object, propertyName: string) => {
    registerDecorator({
      propertyName: propertyName as string,
      name: 'isMs',
      target: object.constructor,
      constraints: [],
      options: validatorOptions,
      validator: {
        validate(value: string) {
          return (
            typeof value === 'string' &&
            value.length != 0 &&
            ms(value) !== undefined
          );
        },
        defaultMessage() {
          return `$property must be a valid ms string`;
        },
      },
    });
  };
}
