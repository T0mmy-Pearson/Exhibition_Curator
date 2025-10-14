#!/usr/bin/env node

/**
 * Test Frontend Search Functionality with Mock Data
 */

const API_BASE = 'http://localhost:9090/api';

async function makeRequest(url) {
  try {
    const response = await fetch(url);
    const data = await response.json();
    return { status: response.status, data, ok: response.ok };
  } catch (error) {
    return { status: 0, data: { error: error.message }, ok: false };
  }
}

async function testSearchFunctionality() {
  console.log('🧪 Testing Frontend Search Functionality');
  console.log('=========================================');

  // Test 1: Public Exhibitions Search
  console.log('\n📚 Test 1: Public Exhibitions Search...');
  const publicResult = await makeRequest(`${API_BASE}/exhibitions/public?limit=10`);
  if (publicResult.ok) {
    console.log(`✅ Found ${publicResult.data.exhibitions?.length || 0} public exhibitions`);
    if (publicResult.data.exhibitions?.length > 0) {
      console.log(`   First: "${publicResult.data.exhibitions[0].title}"`);
      console.log(`   Theme: ${publicResult.data.exhibitions[0].theme}`);
    }
  } else {
    console.log('❌ Public exhibitions search failed');
  }

  // Test 2: Exhibition Search by Query
  console.log('\n🔍 Test 2: Search Exhibitions by Query...');
  const queryResult = await makeRequest(`${API_BASE}/exhibitions/search?q=renaissance&limit=5`);
  if (queryResult.ok) {
    console.log(`✅ Found ${queryResult.data.exhibitions?.length || 0} exhibitions matching "renaissance"`);
    queryResult.data.exhibitions?.forEach((ex, i) => {
      console.log(`   ${i + 1}. "${ex.title}" (${ex.theme})`);
    });
  } else {
    console.log('❌ Query search failed');
  }

  // Test 3: Search by Theme
  console.log('\n🎨 Test 3: Search by Theme...');
  const themeResult = await makeRequest(`${API_BASE}/exhibitions/search?theme=Impressionism&limit=5`);
  if (themeResult.ok) {
    console.log(`✅ Found ${themeResult.data.exhibitions?.length || 0} Impressionism exhibitions`);
  } else {
    console.log('❌ Theme search failed');
  }

  // Test 4: Featured Exhibitions
  console.log('\n⭐ Test 4: Featured Exhibitions...');
  const featuredResult = await makeRequest(`${API_BASE}/exhibitions/featured?limit=5`);
  if (featuredResult.ok) {
    console.log(`✅ Found ${featuredResult.data.exhibitions?.length || 0} featured exhibitions`);
  } else {
    console.log('❌ Featured exhibitions failed');
  }

  // Test 5: Trending Exhibitions
  console.log('\n📈 Test 5: Trending Exhibitions...');
  const trendingResult = await makeRequest(`${API_BASE}/exhibitions/trending?limit=5`);
  if (trendingResult.ok) {
    console.log(`✅ Found ${trendingResult.data.exhibitions?.length || 0} trending exhibitions`);
  } else {
    console.log('❌ Trending exhibitions failed');
  }

  // Test 6: Available Themes
  console.log('\n🏷️ Test 6: Available Themes Analysis...');
  if (publicResult.ok && publicResult.data.exhibitions) {
    const themes = [...new Set(publicResult.data.exhibitions.map(ex => ex.theme))];
    console.log(`✅ Available themes: ${themes.join(', ')}`);
    
    // Count artworks by theme
    const themeStats = {};
    publicResult.data.exhibitions.forEach(ex => {
      themeStats[ex.theme] = (themeStats[ex.theme] || 0) + (ex.artworks?.length || 0);
    });
    console.log('   Artworks per theme:');
    Object.entries(themeStats).forEach(([theme, count]) => {
      console.log(`     ${theme}: ${count} artworks`);
    });
  }

  console.log('\n🎉 Search functionality testing complete!');
  console.log('\n💡 Frontend URLs to test:');
  console.log('   🏠 Homepage: http://localhost:3001');
  console.log('   🔍 Search Page: http://localhost:3001/search');
  console.log('   📚 Direct Exhibition Search: http://localhost:3001/search?mode=exhibitions');
  console.log('   🎨 Direct Artwork Search: http://localhost:3001/search?mode=artworks');
}

testSearchFunctionality().catch(console.error);