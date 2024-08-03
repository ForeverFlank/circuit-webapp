let uniqueNumber = 0;
export function unique(str = "") {
    uniqueNumber++;
    return (
        str +
        "_" +
        uniqueNumber.toString() +
        "_" +
        Math.floor(Math.random() * 2 ** 32).toString(16) +
        Date.now().toString(16)
    );
}