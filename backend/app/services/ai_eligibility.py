def calculate_eligibility(user_profile, application_data):
    """
    Rule-based expert system for visa eligibility prediction.
    Returns probability (0-100) and detailed advice.
    """
    probability = 50
    reasons_high = []
    reasons_low = []
    advice = []

    income = user_profile.get("monthly_income", 0) or 0
    bank_balance = user_profile.get("bank_balance_avg_6m", 0) or 0
    trip_cost = application_data.get("estimated_trip_cost", 0)
    destination = application_data.get("destination_country", "").lower()
    employment = user_profile.get("employment_status", "")
    has_property = user_profile.get("has_property", False)
    dependents = user_profile.get("has_dependents", 0)
    prior_travel = user_profile.get("prior_international_travel", False)
    prior_schengen = user_profile.get("prior_schengen_visa", False)
    prior_us_uk = user_profile.get("prior_us_uk_canada_visa", False)
    refused = user_profile.get("ever_refused_visa", False)

    if income > 5000:
        probability += 15
        reasons_high.append("Strong monthly income")
    elif income > 2000:
        probability += 5
        reasons_high.append("Decent monthly income")

    if bank_balance > 50000:
        probability += 15
        reasons_high.append("Strong bank balance")
    elif bank_balance > 20000:
        probability += 8
        reasons_high.append("Adequate bank balance")

    if trip_cost > 0 and bank_balance > trip_cost * 3:
        probability += 10
        reasons_high.append("Sufficient funds for trip duration")
    elif trip_cost > 0 and bank_balance < trip_cost:
        probability -= 15
        reasons_low.append("Insufficient funds for trip")

    if employment in ["Employed", "Self-Employed", "Business Owner"]:
        probability += 15
        reasons_high.append("Stable employment")
    elif employment == "Student":
        probability += 5

    if has_property:
        probability += 10
        reasons_high.append("Property ownership shows strong ties to home country")

    if dependents > 2:
        probability += 5
        reasons_high.append("Family ties in home country")

    if prior_travel:
        probability += 10
        reasons_high.append("Prior international travel history")

    if prior_schengen and "schengen" in destination:
        probability += 15
        reasons_high.append("Prior Schengen visa - strong track record")

    if prior_us_uk and destination in ["united states", "usa", "united kingdom", "uk"]:
        probability += 15
        reasons_high.append("Prior US/UK visa - strong track record")

    if refused:
        probability -= 25
        reasons_low.append("Previous visa refusal on record")

    probability = max(0, min(100, probability))

    if probability >= 70:
        advice.append(
            "Your profile shows strong eligibility. We recommend proceeding with the application."
        )
    elif probability >= 50:
        advice.append(
            "Your profile is moderate. Consider strengthening your financial documentation and ensuring all travel history is accurately recorded."
        )
    else:
        advice.append(
            "Your profile faces challenges. We recommend addressing the issues above before applying, or consider consulting with a visa specialist."
        )

    if destination in [
        "schengen",
        "france",
        "germany",
        "italy",
        "spain",
        "netherlands",
    ]:
        advice.append(
            "For Schengen visas, ensure you have comprehensive travel insurance covering at least 30,000 EUR."
        )

    if destination in ["united states", "usa"]:
        advice.append(
            "US visa applications require a personal interview. Schedule your appointment well in advance."
        )

    if destination in ["united kingdom", "uk"]:
        advice.append(
            "UK visa applications have specific financial requirements. Ensure 3 months of bank statements are available."
        )

    return {
        "probability": probability,
        "reasons_high": reasons_high,
        "reasons_low": reasons_low,
        "advice": advice,
    }
