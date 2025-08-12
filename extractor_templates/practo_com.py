from bs4 import BeautifulSoup

def extract_structured_data_from_practo(html, url):
    soup = BeautifulSoup(html, "html.parser")
    data = {"source_url": url}

    def safe_select(selector):
        el = soup.select_one(selector)
        return el.get_text(strip=True) if el else "NA"

    def safe_select_all(selector):
        return ", ".join(el.get_text(strip=True) for el in soup.select(selector)) or "NA"

    data["name"] = safe_select("h1")
    data["clinic_name"] = safe_select("div.c-profile__clinic__name h2 a")
    data["education"] = safe_select("div.info-section p")
    data["experience"] = safe_select("div.info-section h2")
    data["speciality"] = safe_select(".u-d-inline-flex, div span > h2, div span")
    data["address"] = safe_select("div.c-profile--clinic__address, div p.address")
    data["mci"] = safe_select("#registrations div.pure-u-1")
    data["passing_year"] = safe_select("#education span span")
    data["memberships"] = safe_select_all("#memberships .p-entity--list")
    data["fees"] = safe_select("[data-qa-id='consultation_fee'], div div:nth-of-type(3) > div")
    data["timing"] = safe_select("[data-qa-id='timings_list'], div.u-cushion--left")
    data["awards"] = safe_select_all("#awards\\ and\\ recognitions .pure-u-1")
    data["specializations"] = safe_select_all("#specializations .pure-u-1")
    data["full_education"] = safe_select_all("#education .pure-u-1")
    data["full_experience"] = safe_select_all("#experience .pure-u-1")
    data["registrations"] = safe_select_all("#registrations .pure-u-1")
    data["services"] = safe_select_all("#services .pure-u-1-3")

    # Multiple clinic support
    clinics = soup.select(".c-profile--clinic--item")
    seen_clinics = set()
    index = 1
    for clinic in clinics:
        try:
            cname = clinic.select_one(".c-profile--clinic__name")
            cname_text = cname.get_text(strip=True) if cname else "NA"
            if cname_text in seen_clinics:
                continue
            seen_clinics.add(cname_text)

            data[f"clinic__name{index}"] = cname_text
            data[f"address{index}"] = clinic.select_one(".c-profile--clinic__address").get_text(strip=True) if clinic.select_one(".c-profile--clinic__address") else "NA"
            data[f"timing{index}"] = clinic.select_one(".u-cushion--left").get_text(strip=True) if clinic.select_one(".u-cushion--left") else "NA"
            data[f"fee{index}"] = clinic.select_one("[data-qa-id='consultation_fee']").get_text(strip=True) if clinic.select_one("[data-qa-id='consultation_fee']") else "NA"
            index += 1
        except:
            continue

    return data
