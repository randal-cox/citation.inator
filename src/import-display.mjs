// Preview only: retain complete image payloads in the editable/exported source.
export const readableImportSource=source=>source.replace(/data:image\/[a-z0-9.+-]+;base64,[A-Za-z0-9+/=]+/giu,'[embedded image]');
