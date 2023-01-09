
type CompressionFormatType = "gzip" | "deflate" | "deflate-raw";

declare global {
  var DecompressionStream: any;
  var CompressionStream: any;
}

export function decompressionFile(file: Blob | ReadableStream, format: CompressionFormatType = "gzip"): ReadableStream<any> {
  const ds = new DecompressionStream(format);
  if (file instanceof Blob) return file.stream().pipeThrough(ds);
  else return file.pipeThrough(ds);
}

export function compressionFile(file: Blob | ReadableStream, format: CompressionFormatType = "gzip"): ReadableStream<any> {
  const cs = new CompressionStream(format);
  if (file instanceof Blob) return file.stream().pipeThrough(cs);
  else return file.pipeThrough(cs);
}
