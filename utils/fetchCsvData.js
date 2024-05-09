export async function fetchCsvData(url) {
    const response = await fetch(url);
    const text = await response.text();
    const lines = text.split("\n");
    
    // exclude empty rows and the first row (header)
    const data = lines
        .filter(line => line.trim() !== "") // exclude empty rows
        .slice(1) // exclude the first row (header)
        .map(line => line.split(","));
    
    return data;
}