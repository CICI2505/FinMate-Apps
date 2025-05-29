// Report mapper - transforms story data to report format expected by template
const reportMapper = (story) => {
  console.log('Mapping story to report format:', story);
  
  // Handle different possible image field names and formats
  let evidenceImages = [];
  if (story.evidenceImages && Array.isArray(story.evidenceImages)) {
    evidenceImages = story.evidenceImages;
  } else if (story.photoUrl) {
    evidenceImages = [story.photoUrl];
  } else if (story.photo) {
    evidenceImages = [story.photo];
  } else if (story.image) {
    evidenceImages = [story.image];
  } else if (story.images && Array.isArray(story.images)) {
    evidenceImages = story.images;
  } else {
    evidenceImages = ['images/placeholder-image.jpg']; // fallback
  }
  
  // Handle location data - ensure it's in the format the template expects
  let location = {};
  if (story.location && typeof story.location === 'object') {
    location = {
      placeName: story.location.placeName || story.location.name || 'Unknown Location',
      lat: story.location.lat || story.location.latitude || null,
      lng: story.location.lng || story.location.longitude || null,
      latitude: story.location.latitude || story.location.lat || null,
      longitude: story.location.longitude || story.location.lng || null
    };
  } else {
    location = {
      placeName: story.placeName || story.locationName || 'Unknown Location',
      lat: story.lat || story.latitude || null,
      lng: story.lng || story.longitude || null,
      latitude: story.latitude || story.lat || null,
      longitude: story.longitude || story.lng || null
    };
  }
  
  // Handle reporter name - check multiple possible field names
  let reporterName = 'Unknown Reporter';
  if (story.reporterName) {
    reporterName = story.reporterName;
  } else if (story.reporter && story.reporter.name) {
    reporterName = story.reporter.name;
  } else if (story.author) {
    reporterName = story.author;
  } else if (story.user && story.user.name) {
    reporterName = story.user.name;
  } else if (story.name && !story.title) {
    // Sometimes 'name' might be the reporter name if title doesn't exist
    reporterName = story.name;
  }
  
  // Transform story structure to report structure expected by generateReportItemTemplate
  const mappedReport = {
    id: story.id || `story-${Date.now()}`,
    title: story.title || story.name || 'Untitled Report',
    description: story.description || story.content || story.body || 'No description available',
    evidenceImages: evidenceImages,
    reporterName: reporterName,
    createdAt: story.createdAt || story.date || story.created_at || new Date().toISOString(),
    location: location,
    
    // Additional fields for compatibility
    photoUrl: evidenceImages[0] || '',
    placeNameLocation: location.placeName,
    
    // Keep reporter object for other uses
    reporter: {
      name: reporterName
    },
    
    // Keep all original story data for debugging
    _originalData: story
  };
  
  console.log('Mapped report for template:', mappedReport);
  return mappedReport;
};

export default class BookmarkPresenter {
  #view;
  #model;
 
  constructor({ view, model }) {
    this.#view = view;
    this.#model = model;
  }
 
  async initialGalleryAndMap() {
    console.log('BookmarkPresenter: Starting initialGalleryAndMap');
    this.#view.showReportsListLoading();
 
    try {
      const listOfReports = await this.#model.getAllReports();
      const reports = await Promise.all(listOfReports.map(reportMapper));
 
      const message = 'Berhasil mendapatkan daftar laporan tersimpan.';
      this.#view.populateBookmarkedReports(message, reports);
    } catch (error) {
      console.error('initialGalleryAndMap: error:', error);
      this.#view.populateBookmarkedReportsError(error.message);
    } finally {
      this.#view.hideReportsListLoading();
    }


    const reports = await Promise.all(listOfReports.map(reportMapper));
    console.log('BookmarkPresenter: Mapped reports for template:', reports);

    // Validate that each report has required fields
    const validReports = reports.filter(report => {
      const isValid = report.id && report.title && report.evidenceImages && Array.isArray(report.evidenceImages);
      if (!isValid) {
        console.warn('Invalid report filtered out:', report);
      }
        return isValid;
      });
      
      console.log(`BookmarkPresenter: ${validReports.length} valid reports out of ${reports.length}`);
 
      if (validReports.length === 0) {
        this.#view.populateBookmarkedReportsListEmpty();
        return;
      }

      const message = `Berhasil mendapatkan ${validReports.length} laporan tersimpan.`;
      this.#view.populateBookmarkedReports(message, validReports);
  }
}
