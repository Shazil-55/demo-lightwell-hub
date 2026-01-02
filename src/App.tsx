import { getSlug } from './helper/url.ts';
import projectConfig from './config/project.ts';
import useFonts from './hooks/useFonts.ts';
import { useState, useEffect } from 'react';
import Header from './components/header.tsx';
import Divider from './components/divider.tsx';
import Projects from './components/projects.tsx';
import Title from './components/title.tsx';
import NotFound from './components/notFound.tsx';
import { setFontSize } from './helper/responsiveness.ts';
import MapProjects from './components/maps.tsx';
import FloorPlans from './components/FloorPlans.tsx';

function App() {
  const slug = getSlug();
  const config = projectConfig.find((item) => item.slug === slug);
  const [showMap, setShowMap] = useState(config?.show_map || false);
  const [activeTab, setActiveTab] = useState(showMap ? 'map' : 'projects');

  useEffect(() => {
    if (config) {
      document.title = config.project_title;
    }
  }, [config]);

  useEffect(() => {
    setFontSize();

    window.addEventListener('resize', setFontSize);

    return () => {
      window.removeEventListener('resize', setFontSize);
    };
  }, []);

  useFonts(config?.font_family);

  if (!config) {
    return <NotFound slug={slug} />;
  }

  return (
    <main
      className="proxima-hub"
      style={{
        backgroundColor: config.body_color,
        color: config.font_color,
        fontFamily: config.font_family,
      }}
    >
      <Header
        config={config}
        showMap={showMap}
        setShowMap={setShowMap}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />
      <Title config={config} />
      <Divider config={config} />
      {activeTab === "floor-plans" ? (
        <FloorPlans config={config} />
      ) : showMap ? (
        <MapProjects config={config} showMap={showMap} />
      ) : (
        <Projects config={config} />
      )}
    </main>
  );
}

export default App;
