import { XMLParser } from 'fast-xml-parser';

// Parser for the outer SOAP envelope — do NOT process entities so we get the raw escaped inner XML
const soapParser = new XMLParser({ ignoreAttributes: false, processEntities: false });
// Parser for the inner result XML — no attribute prefix so fields like StartDate, GradePeriod are accessible directly
const dataParser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '' });

export interface DistrictInfo {
  name: string;
  address: string;
  host: string;
  zipcode: string | null;
}

// Decode HTML entities in the inner XML string returned by the school portal SOAP service
function decodeEntities(str: string): string {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'");
}

// Pure-JS SOAP client — no native binaries, no node-expat
async function soapCall(endpoint: string, body: string): Promise<string> {
  const envelope = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">
  <soap:Body>${body}</soap:Body>
</soap:Envelope>`;

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'text/xml; charset=utf-8',
      'SOAPAction': 'http://edupoint.com/webservices/ProcessWebServiceRequest',
    },
    body: envelope,
  });

  if (!res.ok) throw new Error(`SOAP request failed: ${res.status} ${res.statusText}`);

  const text = await res.text();

  // Parse the outer SOAP envelope to extract the inner HTML-entity-encoded XML string
  const parsed = soapParser.parse(text);
  const env = parsed?.['soap:Envelope'] ?? parsed?.Envelope ?? {};
  const soapBody = env?.['soap:Body'] ?? env?.Body ?? {};
  const responseKey = Object.keys(soapBody).find(k => k.includes('Response'));
  const responseObj = responseKey ? soapBody[responseKey] : soapBody;
  const resultKey = Object.keys(responseObj ?? {}).find(k => k.includes('Result'));
  const encodedInner: string = resultKey ? responseObj[resultKey] : '';

  // The inner XML is HTML-entity-encoded (e.g. &lt;Gradebook ...&gt;) — decode it
  return decodeEntities(String(encodedInner));
}

function normalizeDistrictUrl(districtUrl: string): { host: string; baseUrl: string; endpoint: string } {
  let host = '';
  try {
    host = new URL(districtUrl).host;
  } catch {
    host = districtUrl.replace(/^https?:\/\//, '').split('/')[0];
  }

  const baseUrl = `https://${host}`;
  return {
    host,
    baseUrl,
    endpoint: `${baseUrl}/Service/PXPCommunication.asmx`,
  };
}

async function getTestAnalysis(
  baseUrl: string,
  endpoint: string,
  username: string,
  password: string
) {
  const envelope = `<?xml version="1.0" encoding="utf-8"?>
<soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
                 xmlns:xsd="http://www.w3.org/2001/XMLSchema"
                 xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
  <soap12:Body>
    <ProcessWebServiceRequest xmlns="http://edupoint.com/webservices/">
      <userID>${escapeXml(username)}</userID>
      <password>${escapeXml(password)}</password>
      <skipLoginLog>true</skipLoginLog>
      <parent>false</parent>
      <webServiceHandleName>PXPWebServices</webServiceHandleName>
      <methodName>StudentInfo</methodName>
      <paramStr>&lt;Parms/&gt;</paramStr>
    </ProcessWebServiceRequest>
  </soap12:Body>
</soap12:Envelope>`;

  const authRes = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/soap+xml; charset=utf-8',
      Accept: '*/*',
    },
    body: envelope,
  });

  if (!authRes.ok) {
    throw new Error(`Test analysis auth failed: ${authRes.status}`);
  }

  const setCookie = authRes.headers.get('set-cookie') ?? '';
  const sessionMatch = setCookie.match(/ASP\.NET_SessionId=([^;\s]+)/i);
  if (!sessionMatch?.[1]) {
    return null;
  }

  const analysisRes = await fetch(
    `${baseUrl}/api/GB/ClientSideData/Transfer?action=pxp.test.analysis-get`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json, */*',
        Cookie: `ASP.NET_SessionId=${sessionMatch[1]}`,
      },
      body: JSON.stringify({
        FriendlyName: 'pxp.test.analysis',
        Method: 'get',
        Parameters: '{}',
      }),
    }
  );

  if (!analysisRes.ok) {
    throw new Error(`Test analysis request failed: ${analysisRes.status}`);
  }

  return analysisRes.json().catch(() => null);
}

export async function districtLookup(zip: string): Promise<DistrictInfo[]> {
  const zipCode = String(zip).trim();
  if (!/^\d{5}$/.test(zipCode)) {
    throw new Error('Invalid ZIP code');
  }

  const body = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <ProcessWebServiceRequest xmlns="http://edupoint.com/webservices/">
      <userID>EdupointDistrictInfo</userID>
      <password>Edup01nt</password>
      <skipLoginLog>1</skipLoginLog>
      <parent>0</parent>
      <webServiceHandleName>HDInfoServices</webServiceHandleName>
      <methodName>GetMatchingDistrictList</methodName>
      <paramStr>${escapeXml(
        `<Parms><Key>5E4B7859-B805-474B-A833-FDB15D205D40</Key><MatchToDistrictZipCode>${zipCode}</MatchToDistrictZipCode></Parms>`
      )}</paramStr>
    </ProcessWebServiceRequest>
  </soap:Body>
</soap:Envelope>`;

  const res = await fetch('https://support.edupoint.com/Service/HDInfoCommunication.asmx', {
    method: 'POST',
    headers: {
      'Content-Type': 'text/xml; charset=utf-8',
      SOAPAction: 'http://edupoint.com/webservices/ProcessWebServiceRequest',
    },
    body,
  });

  if (!res.ok) {
    throw new Error(`District lookup failed: ${res.status}`);
  }

  const text = await res.text();
  const outer = soapParser.parse(text);
  const env = outer?.['soap:Envelope'] ?? outer?.Envelope ?? {};
  const soapBody = env?.['soap:Body'] ?? env?.Body ?? {};
  const responseKey = Object.keys(soapBody).find((key) => key.includes('Response'));
  const responseObj = responseKey ? soapBody[responseKey] : soapBody;
  const resultKey = Object.keys(responseObj ?? {}).find((key) => key.includes('Result'));
  const encodedInner: string = resultKey ? responseObj[resultKey] : '';
  if (!encodedInner) return [];

  const inner = dataParser.parse(decodeEntities(String(encodedInner)));
  const lists = inner?.DistrictLists ?? {};
  const districtContainer = lists?.DistrictList ?? lists?.DistrictInfos ?? {};
  const districtNodes = districtContainer?.DistrictInfo;
  const items = Array.isArray(districtNodes) ? districtNodes : districtNodes ? [districtNodes] : [];

  return items
    .map((district: any) => {
      const host = district?.PvueURL ?? district?._PvueURL ?? '';
      const address = district?.Address ?? district?._Address ?? '';
      return {
        name: district?.Name ?? district?._Name ?? '',
        address,
        host,
        zipcode: address.match(/(\d{5})(?:-\d{4})?$/)?.[1] ?? null,
      };
    })
    .filter((district) => district.name && district.host);
}

export async function login(districtUrl: string, username: string, password: string) {
  const { baseUrl, endpoint } = normalizeDistrictUrl(districtUrl);

  const makeRequest = async (methodName: string, reportPeriod?: number) => {
    // paramStr is XML sent as a text node — must be entity-escaped
    let parms = '<Parms>';
    if (typeof reportPeriod !== 'undefined') parms += `<ReportPeriod>${reportPeriod}</ReportPeriod>`;
    parms += '</Parms>';

    const soapBody = `<ProcessWebServiceRequest xmlns="http://edupoint.com/webservices/">
  <userID>${escapeXml(username)}</userID>
  <password>${escapeXml(password)}</password>
  <skipLoginLog>1</skipLoginLog>
  <parent>0</parent>
  <webServiceHandleName>PXPWebServices</webServiceHandleName>
  <methodName>${methodName}</methodName>
  <paramStr>${escapeXml(parms)}</paramStr>
</ProcessWebServiceRequest>`;

    const innerXml = await soapCall(endpoint, soapBody);
    if (!innerXml) throw new Error(`Empty response for method ${methodName}`);
    return dataParser.parse(innerXml);
  };

  return {
    getStudentInfo: async () => {
      const res = await makeRequest('StudentInfo');
      return res.StudentInfo ?? res;
    },
    getGradebook: async (period?: number) => {
      const res = await makeRequest('Gradebook', period);
      return res.Gradebook ?? res;
    },
    getAttendance: async () => {
      const res = await makeRequest('Attendance');
      return res.Attendance ?? res;
    },
    getSchoolInfo: async () => {
      const res = await makeRequest('StudentSchoolInfo');
      return res.StudentSchoolInfo ?? res;
    },
    getDocuments: async () => {
      const res = await makeRequest('GetStudentDocumentInitialData');
      return res.StudentDocuments ?? res;
    },
    getReportCard: async (documentGU: string) => {
      const res = await makeRequestWithParams('GetReportCardDocumentData', {
        DocumentGU: documentGU,
      });
      return res.DocumentData ?? res;
    },
    getDocument: async (documentGU: string) => {
      const res = await makeRequestWithParams('GetContentOfAttachedDoc', {
        DocumentGU: documentGU,
      });
      return res ?? {};
    },
    getMail: async () => {
      const res = await makeRequest('SynergyMailGetData');
      return res.SynergyMailDataXML ?? res;
    },
    getAttachment: async (attachmentGU: string) => {
      const res = await makeRequestWithParams('SynergyMailGetAttachment', {
        SmAttachmentGU: attachmentGU,
      });
      return res.AttachmentXML ?? res;
    },
    getTests: async () => {
      return getTestAnalysis(baseUrl, endpoint, username, password);
    },
  };

  async function makeRequestWithParams(
    methodName: string,
    params: Record<string, string | number>
  ) {
    let parms = '<Parms>';
    for (const [key, value] of Object.entries(params)) {
      parms += `<${key}>${escapeXml(String(value))}</${key}>`;
    }
    parms += '</Parms>';

    const soapBody = `<ProcessWebServiceRequest xmlns="http://edupoint.com/webservices/">
  <userID>${escapeXml(username)}</userID>
  <password>${escapeXml(password)}</password>
  <skipLoginLog>1</skipLoginLog>
  <parent>0</parent>
  <webServiceHandleName>PXPWebServices</webServiceHandleName>
  <methodName>${methodName}</methodName>
  <paramStr>${escapeXml(parms)}</paramStr>
</ProcessWebServiceRequest>`;

    const innerXml = await soapCall(endpoint, soapBody);
    if (!innerXml) throw new Error(`Empty response for method ${methodName}`);
    return dataParser.parse(innerXml);
  }
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
