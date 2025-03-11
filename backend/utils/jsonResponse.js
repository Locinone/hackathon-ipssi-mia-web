
export const jsonResponse = (
    res,
    message,
    status,
    data
) => {
    return res.status(status).json({
        status: status,
        message: message,
        data: data
    })
}