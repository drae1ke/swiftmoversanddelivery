function ServicesSection() {
  const services = [
    {
      title: "Courier Services",
      description: "Express same-day delivery within Nairobi, countrywide overnight services, and transparent Cash on Delivery"
    },
    {
      title: "Order Fulfillment Services",
      description: "Inventory management and pick/pack/ship services with API integration support"
    },
    {
      title: "Warehousing Services",
      description: "Seamless end-to-end solutions with facilities across all 47 counties in Kenya"
    }
  ];

  return (
    <section className="services" id="services">
      <div className="container">
        <h2 className="section-title">Our Services</h2>
        <div className="services-grid">
          {services.map((service, index) => (
            <div className="service-card" key={index}>
              <h3>{service.title}</h3>
              <p>{service.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default ServicesSection