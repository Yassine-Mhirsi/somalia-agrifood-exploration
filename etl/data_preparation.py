import pandas as pd
import os
import sqlite3
from dotenv import load_dotenv
from ai_components.region_matcher import get_region_mapping

# Load environment variables
load_dotenv()

def prepare_data():
    # 1. Load Food Prices Data
    fp_path = 'data/raw/wfp_food_prices_som.csv'
    df_prices = pd.read_csv(fp_path, skiprows=[1])
    print("Loading food prices data... ✅")

    # Keep only relevant columns
    df_prices = df_prices[['date', 'admin1', 'commodity', 'usdprice']]
    print("Keeping relevant columns... ✅")

    # Extract year, filter for 2000-2024, remove duplicates
    df_prices['year'] = df_prices['date'].str[:4].astype(int)
    df_prices = df_prices[(df_prices['year'] >= 2000) & (df_prices['year'] <= 2024)]
    df_prices = df_prices.drop(columns=['date'])
    df_prices = df_prices.drop_duplicates(subset=['year', 'admin1', 'commodity'])
    print("Extracting years and cleaning prices data... ✅")

    # Drop rows with NaN in admin1
    df_prices = df_prices[df_prices['admin1'].notna()]
    print("Cleaning geographic labels... ✅")

    # 2. Load Crop Production Data
    c_path = 'data/raw/somalia-admin1-crop-production.csv'
    df_crop_production = pd.read_csv(c_path, skiprows=[1])
    print("Loading crop production data... ✅")

    # 3. AI-based Region Mapping
    admin1_prices = [x for x in df_prices['admin1'].unique() if str(x) != 'nan']
    admin1_crop = [x for x in df_crop_production['admin1_name'].unique() if str(x) != 'nan']
    
    mapping = get_region_mapping(admin1_prices, admin1_crop)

    # 4. Integrate Crop Production Data
    print("Integrating crop production data...")
    indicator_mapping = {
        'crop-production.mai.firr.USD': 'Maize (white)',
        'crop-production.mai.noirr.USD': 'Maize (white)',
        'crop-production.ric.noirr.USD': 'Rice (imported)',
        'crop-production.ric.firr.USD': 'Rice (imported)',
        'crop-production.whe.noirr.USD': 'Wheat',
        'crop-production.whe.firr.USD': 'Wheat'
    }

    df_crop_mapped = df_crop_production.copy()
    df_crop_mapped['commodity'] = df_crop_mapped['indicator'].map(indicator_mapping)
    df_crop_mapped = df_crop_mapped.dropna(subset=['commodity'])

    df_crop_summed = df_crop_mapped.groupby(['admin1_name', 'commodity'])['value'].sum().reset_index()
    df_crop_summed.rename(columns={'value': 'crop_production_value_usd'}, inplace=True)

    # Apply mapping and merge for 2018
    df_prices['admin1_crop_key'] = df_prices['admin1'].map(mapping)
    df_prices_2018 = df_prices[df_prices['year'] == 2018].copy()

    df_prices_2018 = df_prices_2018.merge(
        df_crop_summed, 
        left_on=['admin1_crop_key', 'commodity'], 
        right_on=['admin1_name', 'commodity'], 
        how='left'
    )

    df_prices['crop_production_value_usd'] = None
    df_prices.loc[df_prices['year'] == 2018, 'crop_production_value_usd'] = df_prices_2018['crop_production_value_usd'].values

    # Clean up
    df_prices.drop(columns=['admin1_crop_key'], inplace=True)
    print("Crop production integration completed ✅")

    # 5. Integrate Food Security Indicators
    print("Integrating food security indicators...")
    print("Loading food security indicators data... ✅")
    security_path = 'data/raw/suite-of-food-security-indicators_som.csv'
    df_security = pd.read_csv(security_path, skiprows=[1])

    items_to_extract = {
        "Prevalence of undernourishment (percent) (3-year average)": "prevalence_undernourishment_pct",
        "Average dietary energy supply adequacy (percent) (3-year average)": "dietary_energy_adequacy_pct",
        "Percentage of children under 5 years affected by wasting (percent)": "child_wasting_pct"
    }

    df_security_filtered = df_security[df_security['Item'].isin(items_to_extract.keys())].copy()
    df_security_filtered['Year'] = pd.to_numeric(df_security_filtered['Year'], errors='coerce')
    df_security_filtered['Value'] = pd.to_numeric(df_security_filtered['Value'], errors='coerce')

    df_security_pivoted = df_security_filtered.pivot(index='Year', columns='Item', values='Value').reset_index()
    df_security_pivoted.rename(columns=items_to_extract, inplace=True)

    df_prices = df_prices.merge(df_security_pivoted, left_on='year', right_on='Year', how='left')
    df_prices.drop(columns=['Year'], inplace=True)
    print("Food security indicators integration completed ✅")

    # Add unique ID for each record
    df_prices.insert(0, 'id', range(1, len(df_prices) + 1))

    # 6. Save integrated data
    output_path_csv = 'data/processed/integrated_agrifood_data.csv'
    db_path = 'data/processed/agrifood.db'
    os.makedirs(os.path.dirname(output_path_csv), exist_ok=True)
    
    # Save to CSV
    df_prices.to_csv(output_path_csv, index=False)
    print(f"Final integrated dataset saved to {output_path_csv} ✅")

    # Save to SQLite
    conn = sqlite3.connect(db_path)
    df_prices.to_sql('integrated_data', conn, if_exists='replace', index=False)
    conn.close()
    print(f"Final integrated dataset saved as table 'integrated_data' in {db_path} ✅")

    return df_prices

if __name__ == "__main__":
    integrated_df = prepare_data()
    # print("\nIntegrated Data (Sample with Indicators):")
    # # Show rows where we have security indicators
    # sample = integrated_df.dropna(subset=['prevalence_undernourishment_pct'], how='all').head()
    # print(sample)
