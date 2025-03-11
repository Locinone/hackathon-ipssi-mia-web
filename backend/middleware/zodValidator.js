import { jsonResponse } from "../utils/jsonResponse"
const zodValidator = (schema, property) => {
    return (req, res, next) => {
        try {
            const { error } = schema.validate(req[property])
            if (error) return jsonResponse(res, error.message, 400, null)
            next()
        } catch (error) {
            return jsonResponse(res, error.message, 500, null)
        }
    }
}

export default zodValidator