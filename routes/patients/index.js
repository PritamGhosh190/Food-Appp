const router = require('express').Router()

const {
  addPatient,
  getPatientById,
  getPatients,
  deletePatientsById,
  addLOT,
  getLOTs,
  uploadPatientData,
  deleteLOT,
  updateLOT,
  updatePatient,
  getLOTById,
} = require('../../Controllers/patients/index')

router.get('/', async (req, res) => {

  return res.send('Patients service running...')
})

router.post('/add-patient', async (req, res) => {
  await addPatient(req, res)
})

router.get('/:patientId', async (req, res) => {
  await getPatientById(req, res)
})

// Create a new lot for a patient
router.post('/:patientId/add-lot', async (req, res) => {
  await addLOT(req, res)
})

router.get('/:patientId/get-lots', async (req, res) => {
  await getLOTs(req, res)
})

router.get('/get-lot/:lotId', async (req, res) => {
  await getLOTById(req, res)
})

router.put('/update-patient/:patientId', async (req, res) => {
  await updatePatient(req, res)
})

router.put('/:patientId/update-lot/:lotId', async (req, res) => {
  await updateLOT(req, res)
})

router.delete('/delete-lot/:lotId', async (req, res) => {
  await deleteLOT(req, res)
})

router.post('/get-patients', async (req, res) => {
  await getPatients(req, res)
})

router.delete('/delete-patients', async (req, res) => {
  await deletePatientsById(req, res)
})

router.post('/upload-patient-data', async (req, res) => {
  await uploadPatientData(req, res)
})

module.exports = router
