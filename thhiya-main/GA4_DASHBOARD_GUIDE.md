# GA4 Dashboard Setup Guide for Thhiya

Step-by-step guide to create a comprehensive GA4 dashboard using the data Thhiya sends.

---

## Data Reference: Events & Parameters

### All Events We Track

| Event | Parameters | Description |
| --- | --- | --- |
| `page_view` | `page_path`, `page_title`, `page_location` | Every page navigation |
| `generate_lead` | `lead_source`, `services_requested`, `target_country`, `submission_id` | BANT/MEDDIC/INTENT(BMI) form submission ⭐ |
| `bant_form_started` | `source` | BANT/MEDDIC/INTENT(BMI) form opened |
| `bant_form_section_completed` | `section`, `source` | Each form step completed |
| `contact_form_submit` | `form_type`, `subject`, `source` | Contact form submission |
| `select_content` | `content_type`, `content_id`, `item_id` | CTA clicks, selections |
| `view_item` | `item_id`, `item_name`, `item_category` | Country/service page views |
| `view_item_list` | `item_list_id`, `item_list_name`, `items[]` | Country grid views |
| `search` | `search_term`, `search_category` | Search queries |
| `click` | `link_url`, `link_text`, `outbound: true` | External link clicks |
| `scroll_depth` | `page_id`, `percent_scrolled`, `page_path` | 25%, 50%, 75%, 100% scroll |
| `time_on_page` | `page_id`, `seconds_elapsed`, `page_path` | 30s, 60s, 120s on page |
| `get_insights_clicked` | `service`, `country` | Hero CTA clicks |

---

## Step 1: Register Custom Dimensions

**Location:** Admin → Custom definitions → Create custom dimension

Create these (required for detailed reports):

| Dimension Name | Scope | Event Parameter |
| --- | --- | --- |
| Lead Source | Event | `lead_source` |
| Target Country | Event | `target_country` |
| Services Requested | Event | `services_requested` |
| Content Type | Event | `content_type` |
| Content ID | Event | `content_id` |
| Page ID | Event | `page_id` |
| Percent Scrolled | Event | `percent_scrolled` |
| Seconds Elapsed | Event | `seconds_elapsed` |
| Form Section | Event | `section` |
| Source | Event | `source` |

---

## Step 2: Mark Key Events as Conversions

**Location:** Admin → Events → Toggle "Mark as key event"

| Event | Priority |
| --- | --- |
| `generate_lead` | ⭐ Primary |
| `bant_form_started` | Secondary |
| `contact_form_submit` | Secondary |
| `get_insights_clicked` | Secondary |

---

## Step 3: Create Explorations

**Location:** Explore → Blank

### Exploration 1: Lead Funnel

```text
Technique: Funnel exploration

Steps:
1. bant_form_started
2. bant_form_section_completed (section = section_1)
3. bant_form_section_completed (section = section_2)
4. bant_form_section_completed (section = section_3)
5. bant_form_section_completed (section = section_4)
6. generate_lead

Breakdown: lead_source
```

### Exploration 2: Content Performance

```text
Technique: Free form

Rows:
- page_path
- page_path
- page_id

Values:
- Event count (scroll_depth)
- Event count (time_on_page)
- Active users

Sort: Event count DESC
```

### Exploration 3: User Journey to Conversion

```text
Technique: Path exploration

Starting point: page_view (page_path = /)
Ending point: generate_lead
```

### Exploration 4: CTA Click Analysis

```text
Technique: Free form

Rows:
- content_type
- content_id

Values:
- Event count (select_content)
- Users

Sort: Event count DESC
```

### Exploration 5: Search Terms

```text
Technique: Free form

Rows:
- search_term
- search_category

Values:
- Event count (search)
- Users
```

---

## Step 4: Customize Reports Snapshot

**Location:** Reports → Reports snapshot → Customize

### Recommended Cards

| Card Type | Configuration |
| --- | --- |
| Scorecard | Active users |
| Scorecard | Sessions |
| Scorecard | `generate_lead` event count |
| Scorecard | Engagement rate |
| Time series | Users over time |
| Bar chart | Events by event_name |
| Table | Top pages (path + views) |
| Geo map | Users by country |
| Pie chart | Device category |

---

## Step 5: Create Custom Reports

**Location:** Reports → Library → Create new report

### Report 1: Lead Generation

| Widget | Type | Data |
| --- | --- | --- |
| Form Starts | Scorecard | `bant_form_started` count |
| Leads | Scorecard | `generate_lead` count |
| Conversion Rate | Scorecard | Calculated |
| Leads by Source | Table | lead_source × event count |
| Leads Over Time | Line chart | generate_lead by day |

### Report 2: Engagement

| Widget | Type | Data |
| --- | --- | --- |
| Page Views | Scorecard | Views |
| Scroll Events | Scorecard | `scroll_depth` count |
| Time Events | Scorecard | `time_on_page` count |
| Page Engagement | Table | page_id × scroll/time events |
| CTA Clicks | Bar chart | content_id × select_content |

---

## Quick Access Reference

| What You Need | Where in GA4 |
| --- | --- |
| Live activity | Reports → Realtime |
| All events | Reports → Engagement → Events |
| Page stats | Reports → Engagement → Pages and screens |
| Traffic sources | Reports → Acquisition → Overview |
| Conversions | Reports → Engagement → Conversions |
| Custom analysis | Explore → Create new |
| Event details | Events → Click event name → Parameters |

---

## Data Retention

**Location:** Admin → Data collection → Data retention

Set to **14 months** for historical analysis.

---

## Testing Your Setup

1. Open [thhiya.com](https://www.thhiya.com) in browser
2. Accept cookies
3. Go to GA4 → Reports → Realtime
4. Navigate site and watch events appear
5. Verify custom dimensions show data in Explorations
