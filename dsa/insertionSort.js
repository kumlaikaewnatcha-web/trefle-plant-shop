function insertionSortByName(plants) {
  const result = [...plants];

  for (let i = 1; i < result.length; i++) {
    const current = result[i];
    let j = i - 1;

    while (
      j >= 0 &&
      result[j].common_name.localeCompare(
        current.common_name,
        "en",
        { sensitivity: "base" }
      ) > 0
    ) {
      result[j + 1] = result[j];
      j--;
    }

    result[j + 1] = current;
  }

  return result;
}

module.exports = insertionSortByName;