export interface MailMessage {
  EntryID: string;
  Subject: string;
  SenderName: string;
  SenderEmailAddress: string;
  ReceivedTime: string;
  Body: string;
  HTMLBody?: string;
  Unread: boolean;
  Importance: number;
  HasAttachments: boolean;
  AttachmentCount: number;
  Attachments?: AttachmentInfo[];
  To?: string;
  CC?: string;
  BCC?: string;
  FolderPath?: string;
}

export interface AttachmentInfo {
  Index: number;
  FileName: string;
  Size: number;
  Type: number;
}

export interface MailFolder {
  Name: string;
  EntryID: string;
  FolderPath: string;
  UnreadItemCount: number;
  ItemCount: number;
  Folders?: MailFolder[];
}

export interface SendMailParams {
  to: string;
  subject: string;
  body: string;
  cc?: string;
  bcc?: string;
  html?: boolean;
  attachments?: string[];
}
