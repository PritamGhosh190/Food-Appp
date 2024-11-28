const Patient = require('../../../models/Patient')

// function getDataBasedOnField(field) {
//   return new Promise(async (resolve, reject) => {
//     try {
//       const data = await Patient.aggregate([
//         {
//           $group: {
//             _id: `$${field}`,
//             type: {$first: `$${field}`},
//             value: {$sum: 1},
//           },
//         },
//       ])
//       resolve(data)
//     } catch (err) {
//       reject(err)
//     }
//   })
// }
// function getDataForBarChart(field) {
//   return new Promise(async (resolve, reject) => {
//     try {
//       const data = await Patient.aggregate([
//         {
//           $group: {
//             _id: {
//               $dateToString: {
//                 format: '%Y-%m-%d',
//                 date: `$${field}`,
//               },
//             },
//             type: {$first: `$${field}`},
//             value: {$sum: 1},
//           },
//         },
//       ])
//       resolve(data)
//     } catch (err) {
//       reject(err)
//     }
//   })
// }
function getDataBasedOnField(array, field) {
  return new Promise((resolve, reject) => {
    try {
      const result = array.reduce((acc, obj) => {
        const key = obj[field];
        if (!acc[key]) {
          acc[key] = { type: key, value: 0 };
        }
        acc[key].value += 1;
        return acc;
      }, {});

      // Convert result object to an array
      const data = Object.values(result);
      resolve(data);
    } catch (err) {
      reject(err);
    }
  });
}

function getDataForBarChart(array, field) {
  return new Promise((resolve, reject) => {
    try {
      const result = array.reduce((acc, obj) => {
        const dateStr = obj[field].toISOString().split('T')[0]; // Convert date to 'YYYY-MM-DD' format
        if (!acc[dateStr]) {
          acc[dateStr] = { type: obj[field], value: 0 };
        }
        acc[dateStr].value += 1;
        return acc;
      }, {});

      // Convert result object to an array
      const data = Object.keys(result).map(key => ({
        _id: key,
        type: result[key].type,
        value: result[key].value,
      }));
      resolve(data);
    } catch (err) {
      reject(err);
    }
  });
}


function convertToURLSearchParams(filter) {
  const params = new URLSearchParams();

  for (const key in filter) {
    if (filter.hasOwnProperty(key)) {
      params.set(key, filter[key]);
    }
  }

  return params;
}

const pieChart = async (req, res) => {
  try {
    const field = req.body.field
    const filtervalue=req.body.filter
    const params =convertToURLSearchParams(filtervalue)
     const search = params.get('search') || ''
    const filters = {}
    console.log("fcfcfcfc11",params,"patientcount111");

    for (const [param, value] of params) {
      // Create a regex pattern for each parameter's value (case-insensitive)
      if (
        param === 'dob' ||
        param === 'date_of_last_follow_up' ||
        param === 'date_of_hpe_diagnosis' ||
        param === 'small_cell_transformation_date' ||
        param === 'date_of_hpe_diagnosis'
      ) {
        let parts = value.split(',')

        let lte = parts[0] ? new Date(parts[0]) : new Date()
        let gte = parts[1] ? new Date(parts[1]) : new Date()

        filters[param] = {
          $gte: lte,
          $lte: gte,
        }
        continue
      } else if (param === 'date_of_start_of_treatment' || param === 'date_of_progression') {
        let parts = value.split(',')
        let lte = parts[0] ? new Date(parts[0]) : new Date()
        let gte = parts[1] ? new Date(parts[1]) : new Date()

        filters['lots.' + param] = {
          $gte: lte,
          $lte: gte,
        }
        continue
      }

      const regexPattern = {
        $regex: new RegExp(params.get(param) || '', 'i'),
      }


      switch (param) {
        case 'treatment':
          filters['lots.treatment'] = regexPattern
          break
        case 'drug_name_targeted':
          filters['lots.drug_name_targeted'] = regexPattern
          break
        case 'drug_name_chemo':
          filters['lots.drug_name_chemo'] = regexPattern
          break
        case 'drug_name_immuno':
          filters['lots.drug_name_immuno'] = regexPattern
          break
        case 'response_pet_ct':
          filters['lots.response_pet_ct'] = regexPattern
          break
        case 'intracranial_response':
          filters['lots.intracranial_response'] = regexPattern
          break
        case 'progressed_on_line':
          filters['lots.progressed_on_line'] = regexPattern
          break
        case 'biopsy_progression':
          filters['lots.biopsy_progression'] = regexPattern
          break
        case 'ngs_at_progression':
          filters['lots.ngs_at_progression'] = regexPattern
          break
        case 'ngs_result':
          filters['lots.ngs_result'] = regexPattern
          break
        default:
          filters[param] = regexPattern
          break
      }
    }
    // Remove filters with empty values

    Object.keys(filters).forEach(
      (key) => (filters[key] === '' || undefined) && delete filters[key]
    )

    const patients = await Patient.aggregate([
      {
        $lookup: {
          from: 'lots',
          localField: '_id',
          foreignField: 'patient',
          as: 'lots',
        },
      },
      {
        $addFields: {
          lots: {
            $map: {
              input: '$lots',
              as: 'lot',
              in: {
                treatment: '$$lot.treatment',
                drug_name_targeted: '$$lot.drug_name_targeted',
                drug_name_chemo: '$$lot.drug_name_chemo',
                drug_name_immuno: '$$lot.drug_name_immuno',
                date_of_start_of_treatment: '$$lot.date_of_start_of_treatment',
                response_pet_ct: '$$lot.response_pet_ct',
                intracranial_response: '$$lot.intracranial_response',
                progressed_on_line: '$$lot.progressed_on_line',
                date_of_progression: '$$lot.date_of_progression',
                biopsy_progression: '$$lot.biopsy_progression',
                ngs_at_progression: '$$lot.ngs_at_progression',
                ngs_result: '$$lot.ngs_result',
                other_remarks: '$$lot.other_remarks',
              },
            },
          },
        },
      },
      {
        $match: {
          ...filters,
          $and: [
            {
              $or: [
                // Patient fields
                {cr_number: {$regex: new RegExp(search, 'i')}},
                {name: {$regex: new RegExp(search, 'i')}},
                {age: {$regex: new RegExp(search, 'i')}},
                {dob: {$regex: new RegExp(search, 'i')}},
                {'lots.treatment': {$regex: new RegExp(search, 'i')}},
                {'lots.drug_name_targeted': {$regex: new RegExp(search, 'i')}},
                {'lots.drug_name_chemo': {$regex: new RegExp(search, 'i')}},
                {'lots.drug_name_immuno': {$regex: new RegExp(search, 'i')}},
                {'lots.response_pet_ct': {$regex: new RegExp(search, 'i')}},
                {
                  'lots.intracranial_response': {
                    $regex: new RegExp(search, 'i'),
                  },
                },
                {'lots.progressed_on_line': {$regex: new RegExp(search, 'i')}},
                {'lots.date_of_progression': {$regex: new RegExp(search, 'i')}},
                {'lots.biopsy_progression': {$regex: new RegExp(search, 'i')}},
                {'lots.ngs_at_progression': {$regex: new RegExp(search, 'i')}},
                {'lots.ngs_result': {$regex: new RegExp(search, 'i')}},
              ],
            },
            {is_deleted: false},
          ],
        },
      },
      
    ])
    const patientCount = patients.length
    console.log("fcfcfcfc",params,"patientcount",patientCount);

    let data = []
    if (
      field === 'age' ||
      field === 'dob' ||
      field === 'date_of_last_follow_up' ||
      field === 'date_of_hpe_diagnosis' ||
      field === 'small_cell_transformation_date' ||
      field === 'date_of_hpe_diagnosis'
    ) {
      data = await getDataForBarChart(patients,field)
    } else {
      data = await getDataBasedOnField(patients,field)
    }
    
    // Send the response with the data
    return res.status(200).json({
      message: 'Data fetched successfully',
      chartData: data,
    })
  } catch (err) {
    console.log("errors ",err);
    return res.status(500).json({
      message: 'Unable to fetch data',
      error: err.message,
    })
  }
}

module.exports = pieChart
