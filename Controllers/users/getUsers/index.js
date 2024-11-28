const User = require("../../../models/User")

const getUsers = async (req, res) => {
  try {
    const params = new URLSearchParams(req.query)
    const page = parseInt(params.get('page')) || 1
    const perPage = parseInt(params.get('rowsPerPage')) || 10
    const sort = params.get('sort') || 'createdAt'
    const order = params.get('order') || 'ascend'
    const search = params.get('search') || ''

    //make filters array of objects
    const filters = {}
    for (const [param, value] of params) {
      // Create a regex pattern for each parameter's value (case-insensitive)
      if (
        param === 'page' ||
        param === 'rowsPerPage' ||
        param === 'sort' ||
        param === 'order'
      )
        continue

      if (param === 'created_at' || param === 'updated_at') {
        const parts = value.split('/')
        const date = new Date(
          parts[2],
          parts[1] - 1,
          (parseInt(parts[0]) + 1).toString()
        ).toISOString()
        filters[param] = {
          $lte: date,
          $gte: new Date(parts[2], parts[1] - 1, parts[0]).toISOString(),
        }
        continue
      }

      const regexPattern = {
        $regex: new RegExp(params.get(param) || '', 'i'),
      }
      filters[param] = regexPattern
    }
    // remove filters with empty values
    Object.keys(filters).forEach(
      (key) => (filters[key] === '' || undefined) && delete filters[key]
    )

    const users = await User.aggregate([
      {
        $match: {
          ...filters,
        },
      },
    ])
      .sort({ [sort]: order === 'ascend' ? 1 : -1 })
      .skip((page - 1) * perPage)
      .limit(perPage)
      .exec()

    const usersCount = await User.countDocuments({
      ...filters,
      is_deleted: false,
    })

    return res.status(200).json({
      success: true,
      users: users,
      totalCount: usersCount,
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
    })
  }
}

module.exports = getUsers
