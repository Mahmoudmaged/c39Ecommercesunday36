



class ApiFeatures {

    constructor(mongooseQuey, queryData) {
        this.mongooseQuey = mongooseQuey;
        this.queryData = queryData
    }

    paginate() {
        let { page, size } = this.queryData;
        if (!page || page <= 0) {
            page = 1
        }

        if (!size || size <= 0) {
            size = 2
        }
        size = parseInt(size)
        page = parseInt(page)
        this.mongooseQuey.limit(size).skip((page - 1) * size)

        return this
    }

    sort() {
        this.mongooseQuey.sort(this.queryData.sort?.replaceAll(',', ' '))
        return this
    }

    search() {
        if (this.queryData.search) {

            this.mongooseQuey.find({
                $or: [
                    { name: { $regex: this.queryData.search, $options: "i" } },
                    { description: { $regex: this.queryData.search, $options: "i" } },
                ]
            })
        }
        return this
    }

    select() {
        this.mongooseQuey.select(this.queryData.fields?.replaceAll(",", ' '))
        return this
    }

    filter() {
        const filterQuery = { ...this.queryData }
        const excludeFromQuery = ['page', 'size', 'sort', 'search', 'fields', 'limit']
        excludeFromQuery.forEach(param => {
            delete filterQuery[param]
        });
        this.mongooseQuey.find(JSON.parse(JSON.stringify(filterQuery).replace(/(gt|gte|lt|lte|in|nin|neq)/g, match => `$${match}`)))
        return this
    }
}

export default ApiFeatures