export type Persona = "b2b" | "operations" | "leadership" | "admin";
export type Workspace = "b2b" | "operations" | "reports";

export type MeetingType = "In Person" | "Online";
export type MeetingStatus = "Scheduled" | "Completed" | "Rescheduled" | "Cancelled";

export type ConsultantStatus =
  | "Pending"
  | "MOU Signed"
  | "UTM Ready"
  | "Active"
  | "Inactive";

export type MouStatus =
  | "Requested"
  | "Verification"
  | "Rework"
  | "Approved"
  | "WO Generated"
  | "WO Sent"
  | "Awaiting Signature"
  | "Signed"
  | "Legal Review"
  | "Finance Approval";

export type CommercialType = "Standard" | "Non-Standard";
export type StandardSlab = "Standard Slab A" | "Standard Slab B" | "Standard Slab C";

export type DocType = "PAN" | "GST" | "Bank Details" | "Authorized Signatory" | "Other" | "Visiting Card" | "Signed WO";
export type DocStatus = "Missing" | "Uploaded" | "Verified" | "Needs Review";

export type VerificationFlag = "Match" | "Missing" | "Needs Review";

export type MergeRequestStatus = "Pending" | "Approved" | "Rejected";
export type CouponStatus = "Active" | "Inactive" | "Expired";
export type UtmStatus = "Requested" | "Created" | "Mapped" | "Inactive";
export type WeeklyReportStatus = "Draft" | "Ready" | "Reviewed";

export interface B2BMember {
  id: string;
  name: string;
  email: string;
  region: string;
  role: "B2B Member" | "B2B Lead" | "Operations" | "Admin" | "Leadership";
}

export interface Meeting {
  id: string;
  consultantId?: string;
  consultantName: string;
  date: string;
  time: string;
  type: MeetingType;
  status: MeetingStatus;
  ownerId: string;
  phone?: string;
  email?: string;
  location?: string;
  notes?: string;
  photoUrl?: string;
  geo?: { lat: number; lng: number; label?: string; capturedAt: string };
  organization?: string;
  createdAt: string;
}

export interface EventInvite {
  memberId?: string;
  email: string;
  name: string;
  status: "Invited" | "Accepted" | "Declined";
}

export interface EventDataFile {
  id: string;
  name: string;
  uploadedAt: string;
  kind: "schedule" | "attendance" | "collateral" | "other";
}

export type EventType = "Career Fair" | "Partner Meet" | "Training" | "Coschedule" | "Other";

export interface EventItem {
  id: string;
  name: string;
  date: string;
  /** Local time HH:MM — blocks meeting create in this window */
  startTime: string;
  endTime: string;
  location: string;
  notes?: string;
  ownerId: string;
  type: EventType;
  photos?: string[];
  invites: EventInvite[];
  /** Uploaded schedule / career-fair timetable (filename stub) */
  scheduleFileName?: string;
  scheduleUploadedAt?: string;
  /** Event-wise uploaded data packs */
  eventData: EventDataFile[];
  createdAt: string;
}

export interface OwnershipRecord {
  id: string;
  consultantId: string;
  ownerId: string;
  ownerName: string;
  fromDate: string;
  toDate?: string;
  reason?: string;
  comments?: string;
}

export interface DocumentItem {
  id: string;
  consultantId: string;
  mouId?: string;
  type: DocType;
  name: string;
  status: DocStatus;
  uploadedAt?: string;
  verification?: VerificationFlag;
}

export interface Consultant {
  id: string;
  name: string;
  organization: string;
  phone: string;
  email: string;
  ownerId: string;
  region: string;
  consultantCode: string;
  existingUtmCode?: string;
  designation?: string;
  status: ConsultantStatus;
  mouStatus: MouStatus | "None";
  utmStatus: UtmStatus | "None";
  firstMeetingId?: string;
  firstMeetingDate?: string;
  firstLeadId?: string;
  firstLeadDate?: string;
  leadsCount: number;
  testTakersCount: number;
  admissionsCount: number;
  incompleteProfile?: boolean;
  createdAt: string;
  updatedAt: string;
  /** When marketing/training pack was emailed to partner */
  materialsSharedAt?: string;
  materialsSharedVia?: "auto_signed" | "manual";
  /** Partner channel — used for school vs coaching targets (Admin/Reports only) */
  partnerKind?: "School" | "Coaching" | "Other";
}

/** Per-user field targets — Admin sets; Reports show achievement. Never shown on B2B UI. */
export interface UserTargets {
  userId: string;
  schools: number;
  consultants: number;
  meetings: number;
  coachings: number;
  updatedAt: string;
  updatedBy?: string;
}

export interface MouRequest {
  id: string;
  consultantId: string;
  meetingId: string;
  requestedBy: string;
  status: MouStatus;
  commercialType: CommercialType;
  slab?: StandardSlab;
  paymentTerms?: string;
  woNumber?: string;
  legalStatus: "Not Started" | "In Review" | "Approved" | "N/A";
  financeStatus: "Not Started" | "In Review" | "Approved" | "N/A";
  reworkItems?: DocType[];
  reworkMessage?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  verifiedAt?: string;
  approvedAt?: string;
  woGeneratedAt?: string;
  woSentAt?: string;
  signedAt?: string;
  slaDueAt: string;
}

export interface UtmRecord {
  id: string;
  code: string;
  consultantId: string;
  counsellorCode?: string;
  parentUtmId?: string;
  status: UtmStatus;
  createdBy: string;
  createdAt: string;
  source: "Existing UTM System";
}

export interface Coupon {
  id: string;
  code: string;
  consultantId: string;
  createdBy: string;
  createdFor: string;
  createdAt: string;
  status: CouponStatus;
}

export interface Lead {
  id: string;
  consultantId: string;
  utmId?: string;
  name: string;
  phone: string;
  createdAt: string;
  source: "Existing Lead System";
}

export interface TestTaker {
  id: string;
  consultantId: string;
  leadId: string;
  name: string;
  examDate: string;
  source: "Existing Exam System";
}

export interface Admission {
  id: string;
  consultantId: string;
  leadId: string;
  name: string;
  admittedAt: string;
  source: "Existing Admission System";
}

export interface MergeRequest {
  id: string;
  primaryId: string;
  duplicateId: string;
  requestedBy: string;
  status: MergeRequestStatus;
  reason: string;
  createdAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
}

export interface ActivityItem {
  id: string;
  consultantId?: string;
  type: string;
  title: string;
  description: string;
  actorId: string;
  createdAt: string;
}

export interface WeeklyReport {
  id: string;
  weekStart: string;
  weekEnd: string;
  status: WeeklyReportStatus;
  meetings: number;
  newConsultants: number;
  mouRequests: number;
  mouSigned: number;
  activeConsultants: number;
  leads: number;
  testTakers: number;
  admissions: number;
  exceptions: {
    mouOverSla: number;
    withoutOwner: number;
    unmappedUtms: number;
    missingDocuments: number;
    other: number;
  };
  notes?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  createdAt: string;
}

export interface ToastItem {
  id: string;
  title: string;
  description?: string;
  variant?: "default" | "success" | "error";
}

export interface AppState {
  persona: Persona;
  workspace: Workspace;
  currentUserId: string;
  members: B2BMember[];
  consultants: Consultant[];
  meetings: Meeting[];
  events: EventItem[];
  mous: MouRequest[];
  utms: UtmRecord[];
  coupons: Coupon[];
  leads: Lead[];
  testTakers: TestTaker[];
  admissions: Admission[];
  ownership: OwnershipRecord[];
  documents: DocumentItem[];
  mergeRequests: MergeRequest[];
  activities: ActivityItem[];
  weeklyReports: WeeklyReport[];
  userTargets: UserTargets[];
  toasts: ToastItem[];
}
