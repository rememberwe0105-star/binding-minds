import { NextRequest, NextResponse } from 'next/server';

/**
 * NZ Charities Services OData API 프록시
 * CC번호로 기관 정보를 조회합니다.
 * 
 * 공식 API: http://www.odata.charities.govt.nz/Organisations
 * 라이선스: CC-BY 3.0 NZ (상업 이용 가능, 인증 불필요)
 */
export async function GET(request: NextRequest) {
  const ccNumber = request.nextUrl.searchParams.get('cc');

  if (!ccNumber) {
    return NextResponse.json({ error: 'CC number is required' }, { status: 400 });
  }

  // CC번호 형식 정규화: "CC12345" or "12345" → "CC12345"
  const normalised = ccNumber.toUpperCase().startsWith('CC')
    ? ccNumber.toUpperCase()
    : `CC${ccNumber}`;

  try {
    const url = `http://www.odata.charities.govt.nz/Organisations?$filter=CharityRegistrationNumber eq '${normalised}'&$format=json&$top=1`;

    const res = await fetch(url, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(10000), // 10초 타임아웃
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: 'Failed to query Charities Services' },
        { status: 502 }
      );
    }

    const data = await res.json();
    const results = data?.d;

    if (!results || results.length === 0) {
      return NextResponse.json({ found: false });
    }

    const org = results[0];

    return NextResponse.json({
      found: true,
      data: {
        name: org.Name || '',
        ccNumber: org.CharityRegistrationNumber || normalised,
        website: org.WebSiteURL || '',
        email: org.EMailAddress1 || org.CharityEmailAddress || '',
        phone: org.Telephone1 || '',
        city: org.PostalAddressCity || org.StreetAddressCity || '',
        status: org.RegistrationStatus || '',
        dateRegistered: org.DateRegistered || '',
        deregistrationDate: org.DeregistrationDate || null,
      },
    });
  } catch (err) {
    console.error('Charities API proxy error:', err);
    return NextResponse.json(
      { error: 'Could not connect to Charities Services. Please try again later.' },
      { status: 502 }
    );
  }
}
