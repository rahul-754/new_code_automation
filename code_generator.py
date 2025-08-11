def generate_extractor_function(function_name, fields):
    func_code = f"def {function_name}(html, url):\n"
    func_code += "    from bs4 import BeautifulSoup\n"
    func_code += "    soup = BeautifulSoup(html, 'html.parser')\n"
    func_code += "    data = {'source_url': url}\n\n"
    func_code += "    def safe_select(selector):\n"
    func_code += "        el = soup.select_one(selector)\n"
    func_code += "        return el.get_text(strip=True) if el else 'NA'\n\n"
    func_code += "    def safe_select_all(selector):\n"
    func_code += "        return ', '.join(el.get_text(strip=True) for el in soup.select(selector)) or 'NA'\n\n"
    for field in fields:
        if field["multiple"]:
            func_code += f"    data['{field['name']}'] = safe_select_all(\"{field['selector']}\")\n"
        else:
            func_code += f"    data['{field['name']}'] = safe_select(\"{field['selector']}\")\n"
    func_code += "\n    return data\n"
    return func_code
