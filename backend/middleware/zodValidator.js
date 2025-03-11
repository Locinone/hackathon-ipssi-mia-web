const jsonResponse = require("../utils/jsonResponse");

const zodValidator = (schema, property) => {
    return (req, res, next) => {
        try {
            console.log(req[property]);
            try {
                const result = schema.parse(req[property]);
                next();
            } catch (error) {
                console.log(error);
                return jsonResponse(
                    res,
                    'Données invalides.',
                    400,
                    { errors: error.errors || error.format() }
                );
            }
        } catch (error) {
            return jsonResponse(res, error.message, 500, null);
        }
    };
};

module.exports = zodValidator;