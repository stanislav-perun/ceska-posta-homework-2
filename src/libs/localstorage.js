export const load = (key) => {
  try {
    const data = localStorage.getItem(key);

    if (!data) return undefined;

    const deserializedData = JSON.parse(data);

    return deserializedData.data;
  } catch {
    return undefined;
  }
};

export const persist = (key, data) => {
  const serializedData = JSON.stringify({
    data,
  });

  localStorage.setItem(key, serializedData)
};
