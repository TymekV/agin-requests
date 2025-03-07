export function formatSize(size: number): string {
    if (size == 0) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
        size /= 1024;
        unitIndex++;
    }

    return `${unitIndex == 0 ? size : size.toFixed(2)} ${units[unitIndex]}`;
}
