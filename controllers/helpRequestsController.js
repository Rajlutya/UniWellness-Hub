const SupportRequest = require('../src/models/supportRequest');
const Counselor = require('../src/models/counselors');
const moment = require('moment');

exports.getHelpRequests = async (req, res) => {
    try {
        const helpRequests = await SupportRequest.find({ counselor: null }).populate('userId');
        const counselors = await Counselor.find({ profileVerified: true });

        const formattedHelpRequests = helpRequests.map((request, index) => ({
            ...request.toObject(),
            serialNo: index + 1,
            dateFormatted: moment(request.createdAt).format('DD-MM-YYYY'),
            timeFormatted: moment(request.createdAt).format('hh:mm A'),
            studentName: request.userId.name,
            studentEmail: request.userId.email,
        }));

        res.render('helpRequests', { helpRequests: formattedHelpRequests, counselors });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

exports.assignCounselor = async (req, res) => {
    const { id } = req.params;
    const { counselorId } = req.body;

    try {
        await SupportRequest.findByIdAndUpdate(id, { counselor: counselorId });
        res.redirect('/helpRequests');
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};
