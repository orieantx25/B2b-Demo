# **PRD — upGrad School of Technology B2B Operations Portal**

**Product:** B2B Operations Portal  
 **Organization:** upGrad School of Technology (uGSOT)  
 **Purpose:** Production-quality functional demo for leadership  
 **Deployment:** Vercel → Internal demo URL  
 **Backend:** Not required for Phase 1 demo  
 **Primary users:** B2B Team, Operations, Leadership  
 **Product principle:** **Capture once → automate the next step → retain human approval where required**

uGSOT currently operates an AI-first B.Tech in Computer Science program and its admission journey includes application, uGNET, interview, counselling/seat blocking and admission. The portal therefore needs to sit around the B2B/consultant operating layer while continuing to consume downstream admission data from existing systems.

---

# **1\. Executive Product Definition**

The **uGSOT B2B Operations Portal** is a centralized operational system for managing the complete consultant lifecycle:

MEETING  
  ↓  
CONSULTANT  
  ↓  
MOU / WO  
  ↓  
UTM / COUPON  
  ↓  
FIRST LEAD  
  ↓  
ACTIVE CONSULTANT  
  ↓  
LEADS / TEST TAKERS / ADMISSIONS  
  ↓  
WEEKLY REPORTING

The application will have **three inter-switchable workspaces**:

┌───────────────────────────────────────────────────────────┐  
│             upGrad School of Technology                   │  
│                                                           │  
│   \[ B2B PORTAL \]   \[ OPERATIONS \]   \[ REPORTS & INSIGHTS \] │  
└───────────────────────────────────────────────────────────┘

### **B2B Portal**

**Do the work**

### **Operations**

**Run the process**

### **Reports & Insights**

**Measure and decide**

---

# **2\. Problem Statement**

The first year of B2B operations has exposed several process gaps.

### **Current problems**

1. Meetings and events are not maintained in one structured system.  
2. Consultant relationships can become dependent on individual B2B SPOCs.  
3. Consultant ownership history is difficult to maintain.  
4. MOU/WO requests involve multiple manual handoffs.  
5. Standard commercial requests consume almost the same effort as exceptions.  
6. Unsigned WOs require manual follow-up.  
7. Consultant codes, UTMs and coupon codes are not centrally mapped.  
8. There is no single consultant lifecycle from first contact to activation.  
9. Leads, test takers and admissions exist in downstream systems but are not connected to the consultant journey operationally.  
10. Weekly reporting requires manual consolidation.  
11. There is no reliable active-consultant view.  
12. Operations spends time on repetitive coordination instead of exceptions and verification.

### **Core issue**

> **Information is captured in multiple places, but the process does not carry that information forward automatically.**

---

# **3\. Product Objective**

Build a lightweight operational layer that:

* Captures B2B activity once  
* Creates a persistent consultant master  
* Maintains consultant ownership history  
* Streamlines standard MOU/WO requests  
* Keeps human approval where required  
* Maps MOU, UTM, coupon and consultant identifiers  
* Fetches downstream performance data  
* Provides consultant-level lifecycle visibility  
* Automates weekly reporting  
* Reduces repetitive human effort  
* Reduces MOU/WO TAT

---

# **4\. Product Principles**

### **Principle 1 — One-time data capture**

If the consultant's:

* Name  
* Phone  
* Email  
* Owner  
* Region  
* Code

already exists, users should **not enter it again**.

---

### **Principle 2 — Automation without removing accountability**

The system should automate:

* Data movement  
* Document extraction  
* Standard WO generation  
* Status updates  
* Mapping  
* Notifications  
* Reporting

But humans remain responsible for:

* Data verification  
* Legal approval  
* Finance approval  
* Exceptions  
* Final operational decisions

---

### **Principle 3 — Don't micromanage B2B**

The B2B interface should feel like:

> **"Help me manage my consultants."**

Not:

> **"Track every minute of my day."**

---

### **Principle 4 — Existing systems remain the source for downstream data**

The portal does **not** replace:

* UTM system  
* Exam system  
* Lead system  
* Admission system  
* Finance payment system  
* CRM

It connects the operational journey around them.

---

# **5\. Scope**

## **Phase 1 — Included**

### **B2B**

* Meetings  
* Meeting completion  
* Rescheduling  
* Events  
* Consultant creation  
* Duplicate detection  
* Consultant history  
* MOU request  
* Document upload  
* UTM request  
* Coupon request  
* Consultant performance

### **Operations**

* MOU queue  
* Document verification  
* OCR assistance  
* Rework  
* Standard commercial selection  
* Standard WO generation  
* MOU/WO status  
* Signed document upload  
* Consultant ownership  
* Merge requests  
* Exceptions

### **Reports**

* B2B performance  
* Consultant performance  
* MOU TAT  
* Active consultants  
* Leads  
* Test takers  
* Admissions  
* Weekly reports

### **Integrations — Demo Simulation**

* CardX  
* UTM system  
* Existing lead system  
* Existing test-taker system  
* Existing admission system

---

# **6\. Explicitly Out of Scope**

Do **not** build these in the demo:

* Actual Finance payment processing  
* Actual payout calculation  
* ROI calculation  
* Revenue calculation  
* CRM replacement  
* Legal system replacement  
* Finance system replacement  
* Real email sending  
* Real authentication  
* Real document storage backend  
* Real OCR API  
* Real UTM generation API

These should be represented through **realistic simulated interactions**.

---

# **7\. Application Architecture**

                    uGSOT B2B OPERATIONS  
                             │  
             ┌───────────────┼───────────────┐  
             ↓               ↓               ↓  
       B2B PORTAL       OPERATIONS      REPORTS &  
                                          INSIGHTS  
             │               │               │  
             └───────────────┼───────────────┘  
                             ↓  
                    CONSULTANT MASTER  
                             │  
            ┌────────────────┼────────────────┐  
            ↓                ↓                ↓  
          MOU/WO          UTM/COUPON       OWNERSHIP  
            │                │                │  
            └────────────────┼────────────────┘  
                             ↓  
                    EXISTING SYSTEMS  
                             │  
            ┌────────────────┼────────────────┐  
            ↓                ↓                ↓  
          LEADS         TEST TAKERS      ADMISSIONS  
                             │  
                             ↓  
                   REPORTS & INSIGHTS  
---

# **8\. Global Navigation**

The header should always contain:

┌─────────────────────────────────────────────────────────────┐  
│ uGSOT                                                       │  
│ B2B Operations                                              │  
│                                                             │  
│ \[ B2B Portal ▼ \]              🔍    🔔    Faiyaz            │  
└─────────────────────────────────────────────────────────────┘

Clicking the workspace switcher:

WORKSPACE

● B2B Portal  
 B2B Team

○ Operations  
 Process Management

○ Reports & Insights  
 Leadership

Switching should be instant.

---

# **9\. Workspace 1 — B2B Portal**

## **Navigation**

Overview  
Meetings & Events  
My Consultants  
MOU / WO  
UTM & Coupons  
My Performance  
---

# **10\. B2B Dashboard**

### **KPI cards**

MY MEETINGS  
24

MY CONSULTANTS  
42

ACTIVE  
18

MOU REQUESTS  
6

LEADS  
824

ADMISSIONS  
31

### **Upcoming Meetings**

Show:

* Consultant  
* Time  
* Location  
* Meeting type  
* Status

Actions:

`Start`

`Reschedule`

`View`

---

# **11\. Meeting Creation**

CTA:

**\+ Schedule Meeting**

### **Required**

* Consultant name  
* Meeting date  
* Meeting time  
* Meeting type

### **Optional**

* Phone  
* Email  
* Location  
* Geo-tagged photo  
* Notes

Meeting type:

○ In Person  
○ Online

Calendar sync:

> **Optional convenience feature**

The calendar is **not the source of truth**.

---

# **12\. Meeting Lifecycle**

SCHEDULED  
  ↓  
START MEETING  
  ↓  
IN PROGRESS  
  ↓  
COMPLETED

Alternative:

SCHEDULED  
  ↓  
RESCHEDULED  
  ↓  
NEW TIME

Multiple meetings with one consultant are allowed.

They remain separate activities but appear under one:

> **Consultant Journey**

---

# **13\. Events**

B2B can create:

**\+ Add Event**

Fields:

* Event name  
* Date  
* Location  
* Event type  
* Number of consultants  
* Optional photographs  
* Notes

Events appear separately from meetings but contribute to B2B activity reporting.

---

# **14\. Consultant Master**

Search:

Search name / phone / email / code...

Filters:

* Owner  
* Region  
* Status  
* MOU  
* Active

Table:

| Consultant | Owner | Region | MOU | Leads | Status |
| ----- | ----- | ----- | ----- | ----- | ----- |
| Career Point | Rahul | South | Signed | 84 | Active |
| ABC Education | Priya | West | WO Sent | 42 | Pending |

---

# **15\. Duplicate Detection**

When creating a consultant:

Possible existing consultant

Career Point

Phone  
98XXXXXX21

Owner  
Rahul Sharma

Last Meeting  
18 Aug 2026

Is this the consultant?

\[Use Existing\]  
\[Create New\]  
\[Request Merge\]  
---

# **16\. Consultant 360**

Every consultant gets one permanent profile.

### **Header**

CAREER POINT

● ACTIVE

Owner  
Rahul Sharma

Region  
South

Consultant Code  
CNS-10284

Actions:

Request MOU  
Request UTM  
Create Coupon  
Transfer Ownership

Tabs:

Overview  
Journey  
Meetings  
MOU / WO  
UTMs  
Coupons  
Performance  
Documents  
Ownership History  
---

# **17\. Consultant Journey**

Visual timeline:

FIRST MEETING  
12 May  
  ↓  
MOU REQUESTED  
13 May  
  ↓  
VERIFIED  
14 May  
  ↓  
WO SENT  
14 May  
  ↓  
SIGNED  
18 May  
  ↓  
FIRST LEAD  
21 May  
  ↓  
ACTIVE

This is the central concept of the application.

---

# **18\. MOU Request**

The B2B member clicks:

**Request MOU**

The application first asks:

> **Is this consultant already in your meeting history?**

Searchable meeting list:

Career Point  
18 Aug · In Person

Career Point  
15 Aug · Online

ABC Education  
14 Aug · In Person

Select → continue.

---

# **19\. MOU Form**

Automatically populate:

* Consultant  
* Phone  
* Email  
* Organization  
* B2B owner  
* Region  
* Consultant code  
* First meeting  
* Meeting history

User then adds:

* Commercial structure  
* Payment terms  
* Required documents

---

# **20\. Document Upload**

Required document configuration should be controlled centrally.

Example:

PAN  
\[Uploaded ✓\]

GST  
\[Upload\]

Bank Details  
\[Uploaded ✓\]

Authorized Signatory  
\[Uploaded ✓\]  
---

# **21\. OCR / CardX**

Visiting card:

Upload Visiting Card

       ↓

CardX

       ↓

Name  
Phone  
Email  
Company  
Designation

OCR should only **assist**.

It must never display:

> "AI Approved"

Instead:

> **AI-assisted verification**

Final approval:

> **Operations**

---

# **22\. Operations Verification**

Operations sees:

Submitted Information  
       │  
       ↓  
OCR / Validation  
       │  
       ↓  
Operations Review  
       │  
       ├──── Reject → Rework  
       │  
       ↓  
Approve

Split screen:

**Document Preview | Extracted / Submitted Data**

Buttons:

`Request Rework`

`Approve & Continue`

---

# **23\. Rework**

Operations selects:

☑ GST Certificate  
☐ PAN  
☐ Bank Details

Adds:

> Please upload the latest GST certificate.

B2B receives:

**Action Required**

---

# **24\. Standard vs Non-Standard**

This is one of the most important process improvements.

Commercial Structure

○ Standard  
○ Non-Standard

### **Standard**

Show pre-approved slabs.

Standard Slab B

✓ Management Approved

Payment structure  
\[Details\]

\[Generate WO\]

### **Non-standard**

Show:

> This request will follow the existing approval workflow.

Then:

Operations  
  ↓  
Finance  
  ↓  
Legal  
  ↓  
WO  
---

# **25\. WO Generation**

After approval:

Generating Standard WO...

Then:

WO-2026-00842

Career Point

Standard Slab B

Status  
READY TO SEND

\[Preview WO\]  
\[Send\]

The demo should show a polished WO preview.

---

# **26\. MOU Tracking**

Status:

REQUESTED       ✓  
VERIFIED        ✓  
WO GENERATED    ✓  
WO SENT         ✓  
AWAITING SIGNATURE ●  
SIGNED           ○

Operations can:

**Mark Signed Copy Received**

Then upload the signed document.

---

# **27\. UTM Management**

UTM requests can happen:

**Before OR after MOU.**

The portal fetches UTM architecture/data from the existing system.

Consultant:

Career Point  
CNS-10284

UTMs

├── UTM-001  
├── UTM-002  
└── UTM-003

UTMs are **children of the consultant**, not independent relationships.

---

# **28\. Coupon Management**

Every coupon must retain:

* Coupon code  
* Consultant  
* Created by  
* Created for  
* Created date  
* Status

Example:

| Coupon | Consultant | Created By | Created For |
| ----- | ----- | ----- | ----- |
| CAREER26 | Career Point | Rahul | Career Point |

---

# **29\. Consultant Activation**

Important business rule:

> **MOU signed ≠ Active**

A consultant becomes:

### **ACTIVE**

when the **first lead associated with that consultant/UTM** appears in the existing lead system.

Timeline:

MOU SIGNED  
     ↓  
UTM CREATED  
     ↓  
FIRST LEAD  
     ↓  
ACTIVE  
---

# **30\. Workspace 2 — Operations**

Navigation:

Operations Overview  
MOU / WO Queue  
Verification  
Rework  
Signed Documents  
Consultant Master  
Ownership  
UTM / Coupon Mapping  
Exceptions  
---

# **31\. Operations Dashboard**

Primary objective:

> **Show Operations what requires action.**

KPIs:

OPEN REQUESTS       24  
NEEDS ACTION          8  
SLA RISK              4  
REWORK                2  
AWAITING SIGNATURE    7  
---

# **32\. Operations Queue**

MOU-2026-00482

Career Point  
Standard Slab B

● Verification Required

Received  
10:42 AM

SLA  
18h remaining

\[Review\]

Use priority indicators.

---

# **33\. Operations Consultant Management**

Operations can:

* Search consultants  
* Edit records  
* Transfer ownership  
* View ownership history  
* Approve merge requests  
* Map identifiers  
* View lifecycle  
* View documents

---

# **34\. Ownership Transfer**

Career Point

Current Owner  
Rahul Sharma

Transfer To  
Priya Singh

Reason  
Territory realignment

Comment  
\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

\[Transfer Ownership\]

History:

May 2026  
Amit Kumar

Aug 2026  
Rahul Sharma

Current  
Rahul Sharma  
---

# **35\. Exception Centre**

MOU \> SLA              4  
Missing Documents      6  
Unsigned WO            8  
Duplicate Consultants  3  
Unmapped UTMs          5

Clicking a number filters the relevant queue.

---

# **36\. Workspace 3 — Reports & Insights**

This is the leadership-facing workspace.

Navigation:

Executive Overview  
B2B Performance  
Consultant Performance  
MOU / WO Efficiency  
Weekly Reports  
---

# **37\. Executive Dashboard**

### **KPI cards**

MEETINGS  
812

CONSULTANTS  
264

ACTIVE  
128

MOU SIGNED  
97

LEADS  
4,826

TEST TAKERS  
1,342

ADMISSIONS  
186  
---

# **38\. Consultant Funnel**

MEETINGS  
812  
 ↓  
CONSULTANTS  
264  
 ↓  
MOU REQUESTED  
143  
 ↓  
SIGNED  
97  
 ↓  
ACTIVE  
76  
 ↓  
LEADS  
4,826  
 ↓  
TEST TAKERS  
1,342  
 ↓  
ADMISSIONS  
186  
---

# **39\. Process Efficiency**

Show:

### **Average MOU TAT**

3.2 days

### **Standard MOU**

1.4 days

### **Non-standard**

4.1 days

### **Requests \> SLA**

4

Include weekly trend charts.

---

# **40\. B2B Performance**

Filters:

* Date  
* Region  
* B2B member

Table:

| B2B Member | Meetings | Consultants | Active | Leads | Admissions |
| ----- | ----- | ----- | ----- | ----- | ----- |
| Rahul | 48 | 21 | 14 | 624 | 24 |
| Priya | 43 | 18 | 11 | 517 | 21 |
| Ankit | 39 | 16 | 9 | 438 | 17 |

---

# **41\. Consultant Performance**

Clicking a consultant opens:

CAREER POINT

Meetings                 8  
MOU                      Signed  
Active                   Yes

Leads                    84  
Test Takers              27  
Admissions                6

UTMs                      3  
Coupons                   2  
---

# **42\. Weekly Reports**

Automated report:

18–24 AUGUST 2026

Meetings                 246  
New Consultants           31  
MOU Requests              24  
MOU Signed                18  
Active Consultants        12  
Leads                  4,826  
Test Takers            1,342  
Admissions               186

Exception section:

4 MOU \> SLA  
2 consultants without owner  
3 unmapped UTMs

Actions:

`Review`

`Edit`

`Download`

`Mark Reviewed`

---

# **43\. Demo Personas**

Because this is a leadership demo, implement a demo persona switcher.

DEMO AS

● B2B Member  
○ Operations  
○ Leadership  
○ Admin

Changing persona changes:

* Navigation  
* Dashboard  
* Available actions  
* Permissions  
* Data

No authentication required.

---

# **44\. Mock Data Requirements**

Seed the demo with realistic data.

### **B2B Members**

20+

### **Consultants**

100+

### **Meetings**

300+

### **Events**

30+

### **MOU Requests**

40+

### **UTMs**

100+

### **Coupons**

50+

### **Leads**

5,000+

### **Test Takers**

1,000+

### **Admissions**

100+

The numbers should be internally consistent.

---

# **45\. Demo Scenarios**

Leadership should be able to experience these without resetting the application.

### **Demo 1**

**Create Meeting**

B2B Portal  
→ Meetings  
→ Schedule  
→ Complete

### **Demo 2**

**Duplicate Consultant**

Create Consultant  
→ Duplicate Detection  
→ Use Existing

### **Demo 3**

**MOU**

Consultant  
→ Request MOU  
→ Documents  
→ Verification  
→ Approve  
→ WO

### **Demo 4**

**Rework**

Operations  
→ MOU Queue  
→ Reject  
→ Request GST  
→ Re-upload  
→ Approve

### **Demo 5**

**UTM**

Consultant  
→ Request UTM  
→ Create Child UTM

### **Demo 6**

**Ownership**

Consultant  
→ Transfer Owner  
→ View History

### **Demo 7**

**Leadership**

Reports  
→ Executive Overview  
→ Consultant  
→ Performance  
→ Weekly Report  
---

# **46\. UI / UX Requirements**

## **Overall Feel**

The application should be:

**Fast**

**Minimal**

**Premium**

**Operational**

**Analytical**

**Easy to understand**

It should **not** look like a generic AI-generated SaaS dashboard.

---

# **47\. uGSOT Visual System**

Use the uGSOT/upGrad visual direction.

Primary:

Dark  
\#11130F

Lime  
\#C9FF3D

Supporting:

White  
\#FFFFFF

Off White  
\#F7F7F4

Grey  
\#6B6D67

Border  
\#E4E5DF

Use lime for:

* Primary CTA  
* Active navigation  
* Important highlights  
* Success states  
* Selected controls

Avoid using lime as the background of large sections.

---

# **48\. Component Style**

### **Cards**

Clean, compact, minimal shadow.

### **Buttons**

Primary:

\[ Create Meeting \]

Secondary:

\[ View Details \]

Destructive:

\[ Request Rework \]

### **Status badges**

● Active  
● Pending  
● Verification  
● Rework  
● Signed

### **Tables**

Dense enough for operations but with comfortable row spacing.

---

# **49\. Animation**

Use subtle animations:

* 150–250ms transitions  
* Drawer slide  
* Modal entrance  
* Toast notifications  
* Skeleton loading  
* Progress states  
* Status transitions

Do **not** use:

* Excessive floating animations  
* Large gradients  
* Decorative motion  
* Constant movement

---

# **50\. Technical Stack**

For the Vercel deployment:

### **Framework**

**Next.js**

### **Language**

**TypeScript**

### **Styling**

**Tailwind CSS**

### **Components**

**shadcn/ui**

### **Icons**

**Lucide**

### **Charts**

**Recharts**

### **State**

React state / Zustand

### **Data**

Local TypeScript mock-data layer

---

# **51\. Frontend Architecture**

/app

/dashboard  
/meetings  
/consultants  
/consultants/\[id\]  
/mou  
/utm  
/performance  
/reports  
/operations  
/admin

/components

/dashboard  
/meetings  
/consultants  
/mou  
/utm  
/reports  
/operations  
/shared

/lib

/mock-data  
/services  
/utils

Important:

The UI must **not** directly depend on hardcoded components.

Create a service layer:

consultantService  
meetingService  
mouService  
utmService  
reportService

Initially these services use mock data.

Later they can be replaced with APIs without redesigning the UI.

---

# **52\. Mock Backend Behaviour**

Even without a backend, interactions must feel real.

For example:

Create Meeting  
     ↓  
Update local state  
     ↓  
Meeting appears in list  
     ↓  
Dashboard KPI updates  
     ↓  
Consultant timeline updates

Similarly:

Approve MOU  
     ↓  
Status changes  
     ↓  
WO appears  
     ↓  
Pipeline updates  
     ↓  
Consultant timeline updates

The demo should **not simply navigate to another static screen**.

State changes should propagate through the UI.

---

# **53\. Important State Relationships**

If a consultant is changed:

Consultant Master  
       ↓  
Meetings  
       ↓  
MOU  
       ↓  
UTM  
       ↓  
Coupons  
       ↓  
Performance

If MOU status changes:

MOU Queue  
    ↓  
Consultant 360  
    ↓  
Journey  
    ↓  
Leadership Dashboard

If a consultant becomes Active:

First Lead  
    ↓  
Consultant \= Active  
    ↓  
Active Consultant KPI  
    ↓  
Leadership Dashboard

This will make the demo feel significantly more sophisticated.

---

# **54\. Success Criteria**

The demo is successful if leadership can understand:

### **Within 30 seconds**

**What is this?**

> A centralized B2B consultant operations system for uGSOT.

### **Within 1 minute**

**What problem does it solve?**

> It connects the consultant lifecycle and removes repetitive coordination.

### **Within 3 minutes**

**How does it work?**

> Meeting → Consultant → MOU → UTM → Activation → Existing Systems → Reporting.

### **Within 5 minutes**

**Why should we build it?**

> Lower TAT, fewer manual touchpoints, better relationship continuity, stronger process visibility and scalable reporting.

---

# **55\. Final Product Story**

The entire application should communicate one simple idea:

                CAPTURE ONCE  
                     ↓  
             STRUCTURE THE DATA  
                     ↓  
            AUTOMATE THE HANDOFF  
                     ↓  
            HUMAN APPROVAL ONLY  
            WHERE IT IS REQUIRED  
                     ↓  
            TRACK THE LIFECYCLE  
                     ↓  
             REPORT AUTOMATICALLY

### **B2B Portal**

**Capture & Execute**

### **Operations**

**Verify & Process**

### **Reports & Insights**

**Measure & Decide**

And the central object connecting all three is:

# **THE CONSULTANT**

                   CONSULTANT  
                       │  
       ┌───────────────┼────────────────┐  
       ↓               ↓                ↓  
    Meetings          MOU              UTMs  
       ↓               ↓                ↓  
     Events            WO            Coupons  
       └───────────────┼────────────────┘  
                       ↓  
                  FIRST LEAD  
                       ↓  
                    ACTIVE  
                       ↓  
            LEADS / TEST TAKERS /  
                ADMISSIONS  
                       ↓  
              REPORTS & INSIGHTS  
