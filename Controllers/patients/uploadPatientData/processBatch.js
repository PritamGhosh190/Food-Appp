const PatientModel = require('../../../models/Patient') // Import your Mongoose model here
const CheckupModel = require('../../../models/LOT') // Import your Mongoose model here

const processBatch = async (batch) => {
  try {
    const treatments = ['l1', 'l2', 'l3', 'l4', 'l5']

    let failedRows = []

    for (const rowData of batch) {

      const dateValues = [
        'Date of Birth',
        'Date_of_Last_follow_up',
        'Date of HPE diagnosis',
        'Small_cell_transformation_date',
        'Date_of_Progression',
        'Date_of_start_of_Rx',
      ]

      for (const dateValue of dateValues) {
        if (rowData[dateValue] && rowData[dateValue].length === 10) {
          rowData[dateValue] = new Date(rowData[dateValue]).toISOString()
        }
      }

      const patientData = {
        cr_number: rowData['CR_Number'],
        name: rowData['Name'],
        age: rowData['Age'],
        dob: rowData['Date of Birth'], // Use undefined if 'Date of Birth' is empty or not defined
        gender: rowData['Gender'],
        state: rowData['State'],
        smoking: rowData['Smoking'],
        family_history: rowData['Family_history'],
        gene: rowData['Gene'],
        variant: rowData['Variant'],
        treatment_at_rgci: rowData['Treatment_At_RGCI'],
        phone_number: rowData['Phone_number'],
        status_at_last_follow_up: rowData['Status_at_last_follow_up'],
        date_of_last_follow_up: rowData['Date_of_Last_follow_up'], // Use undefined if 'Date_of_Last_follow_up' is empty or not defined
        //progressive data
        date_of_hpe_diagnosis: rowData['Date of HPE diagnosis'], // Use undefined if 'Date of HPE diagnosis' is empty or not defined
        ecog_ps: rowData['ECOG_PS'],
        extrathoracic_mets: rowData['Extrathoracic_Mets'],
        brain_mets: rowData['Brain_Mets'],
        letptomeningeal_mets: rowData['Letptomeningeal_Mets'],
        histology: rowData['Histology'],
        pdl1: rowData['PDL1'],
        brg1: rowData['BRG1'],
        ttf1: rowData['TTF1'],
        small_cell_transformation_date: rowData['Small_cell_transformation_date'],
        vaf: rowData['VAF'],
        co_mutation: rowData['Co-mutation'],
      }

      try {
        const patient = new PatientModel(patientData)

        await patient.save()

        for (const tr of treatments) {
          const checkupData = {
            treatment: rowData[`${tr}_line_rx`],
            drug_name_targeted: rowData[`${tr}_Drug_Name_Targeted`],
            drug_name_chemo: rowData[`${tr}_Drug_Name_Chemotherapy`],
            drug_name_immuno: rowData[`${tr}_Drug_Name_Immuno`],
            date_of_start_of_treatment: rowData[`${tr}_Date_of_start_of_Rx`],
            response_pet_ct: rowData[`${tr}_Response_PET_CT`],
            intracranial_response: rowData[`${tr}_Intracranial_response`],
            progressed_on_line: rowData[`${tr}_Progressed_on_line`],
            date_of_progression: rowData[`${tr}_Date_of_Progression`],
            biopsy_progression: rowData[`${tr}_Biopsy_line_Progression`],
            ngs_at_progression: rowData[`${tr}_NGS_at_progression`],
            ngs_result: rowData[`${tr}_NGS_result`],
            other_remarks: rowData[`${tr}_Other_remarks`],
          }

          if (Object.values(checkupData).some((value) => value !== undefined && value !== '')) {
            checkupData.patient = patient._id;
            const lot = new CheckupModel(checkupData);
            try {
              await lot.save();
            } catch (err) {
              console.error(`Error saving lot: ${err}`); // Use 'err' instead of 'error' for the error object
            }
          }
        }
      } catch (err) {
        failedRows.push(err.errors['cr_number'].value)
      }
    }

    return {success: true, insertedCount: batch.length, failedRows: failedRows}
  } catch (error) {
    return {success: false, message: error.message}
  }
}

module.exports = processBatch
