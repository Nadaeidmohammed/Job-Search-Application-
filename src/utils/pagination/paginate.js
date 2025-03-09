export const paginate = async (model, query, page, options = {}) => {
    const limit = 5;
    const skip = limit * (page - 1);
    const { sort = { createdAt: -1 }, populate = null } = options;
    const totalItems = await model.countDocuments(query);
    const totalPages = Math.ceil(totalItems / limit);
    if (page > totalPages && totalItems > 0) {
        throw new Error("Page number exceeds total pages", { cause: 400 });
    }
    let queryChain = model.find(query).skip(skip).limit(limit);
    if (sort) queryChain = queryChain.sort(sort);
    if (populate) queryChain = queryChain.populate(populate);
    const data = await queryChain;
    return {
        data,
        totalItems,
        currentPage: Number(page),
        totalPages,
        itemsPerPage: data.length,
        nextPage: page < totalPages ? Number(page) + 1 : null,
        previousPage: page > 1 ? Number(page) - 1 : null,
    };
};
