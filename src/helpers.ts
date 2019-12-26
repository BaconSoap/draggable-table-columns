export const sortBy = <TArr, TProperty>(array: TArr[], propertyPicker: (item: TArr) => TProperty): TArr[] => {
  return [...array].sort((first, second) => {
    const a = propertyPicker(first);
    const b = propertyPicker(second);

    if (a < b) {
      return -1;
    }

    if (a === b) {
      return 0;
    }

    return 1
  });
};

export const cloneArrayObjects = <TArr>(array: TArr[]): TArr[] => array.map(x => ({ ...x }));