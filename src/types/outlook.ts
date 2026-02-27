// Outlook folder IDs (olDefaultFolders)
export const OlDefaultFolders = {
  olFolderInbox: 6,
  olFolderOutbox: 4,
  olFolderSentMail: 5,
  olFolderDeletedItems: 3,
  olFolderDrafts: 16,
  olFolderJunk: 23,
} as const;

// Body format
export const OlBodyFormat = {
  olFormatUnspecified: 0,
  olFormatPlain: 1,
  olFormatHTML: 2,
  olFormatRichText: 3,
} as const;

// Importance
export const OlImportance = {
  olImportanceLow: 0,
  olImportanceNormal: 1,
  olImportanceHigh: 2,
} as const;

// Item class
export const OlObjectClass = {
  olMail: 43,
  olAppointment: 26,
} as const;
