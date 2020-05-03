const rp = require('request-promise');
const localModel = require('../models/locals');

const getLocals = async ({ params }, res) => {
    const { latitude, longitude } = params;
    const coords = [latitude, longitude]
    let nearPlaces = await localModel.find({ loc: { $nearSphere: { $geometry: { type: "Point", coordinates: coords }, $minDistance: 0, $maxDistance: 2000 } } })
    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=1500&type=restaurant&key=AIzaSyCFUOMeVODKGThaToJ5iO4wMKnwfvQewcs`;
    console.log(url)
    const locals = await rp(url);
    const results = JSON.parse(locals).results;
    if (results.length > 0) {
        results.forEach((result, i) => {
            nearPlaces.forEach((place, j) => {
                if (result.vicinity === place.address) {
                    const vote = calculateVote(place.concurrency);
                    results[i].vote = vote;
                }
            });
        });
        res.send(results);
    } else {
        res.send('error')
    }
}
const mode = arr => {
    return arr.sort((a, b) =>
        arr.filter(v => v.vote === a.vote).length
        - arr.filter(v => v.vote === b.vote).length
    ).pop();
}
const calculateVote = (votes) => {
    var limitDate = new Date();
    limitDate.setHours(limitDate.getHours() - 12);
    const hourAgoVotes = votes.filter(vote => new Date(vote.time) > limitDate);
    return mode(hourAgoVotes).vote;
}
const vote = async ({ body }, res) => {
    let newLocal;
    const place = await localModel.find({ address: body.vicinity });
    const concurrency = {
        vote: body.vote
    }
    if (place.length === 0) {
        const local = {
            name: body.name,
            loc: {
                type: 'Point',
                coordinates: [body.geometry.location.lat, body.geometry.location.lng]
            },
            address: body.vicinity,
            concurrency: [concurrency]
        }
        const newVote = new localModel(local)
        newLocal = await newVote.save();
    } else {
        newLocal = await localModel.update(
            { address: body.vicinity },
            { $push: { concurrency } }
        );
    }
    res.send(newLocal);
}
module.exports = { getLocals, vote }