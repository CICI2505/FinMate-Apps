// api-mapper.js
export const reportMapper = (report) => {
    return {
        ...report,
        placeNameLocation: report.location?.placeName || 'Unknown Location',
        reporterName: report.reporter?.name || 'Unknown Reporter',
    };
};