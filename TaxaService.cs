using System;
using System.Collections.Generic;
using System.Linq;
using System.ServiceModel;
using System.ServiceModel.Activation;
using System.ServiceModel.Web;
using Telerik.Sitefinity.Taxonomies;
using Telerik.Sitefinity.Taxonomies.Model;

namespace SitefinityWebApp.ExtensionScripts
{
    [ServiceContract]
    [AspNetCompatibilityRequirements(RequirementsMode = AspNetCompatibilityRequirementsMode.Required)]
    [ServiceBehavior(IncludeExceptionDetailInFaults = true, InstanceContextMode = InstanceContextMode.Single, ConcurrencyMode = ConcurrencyMode.Multiple)]
    public class TaxaService
    {
        [OperationContract]
        [WebInvoke(Method = "POST", RequestFormat = WebMessageFormat.Json, ResponseFormat = WebMessageFormat.Json)]
        public virtual SimpleTaxonModel[][] GetTaxaByIds(Guid[][] taxaIds)
        {
            TaxonomyManager manager = TaxonomyManager.GetManager();

            // Get All Ids
            List<Guid> allIds = new List<Guid>();
            for (int i = 0; i < taxaIds.Length; i++)
            {
                if (taxaIds[i].Length > 0)
                {
                    allIds.AddRange(taxaIds[i]);
                }
            }

            // Make a call to the database to get all taxa
            var allTags = manager.GetTaxa<Taxon>().Where(t => allIds.Contains(t.Id))
                .Select(t => new SimpleTaxonModel() // Convert the taxon to the model
                {
                    Id = t.Id,
                    Title = t.Title
                }).ToArray();

            // populate the result
            SimpleTaxonModel[][] result = new SimpleTaxonModel[taxaIds.Length][];
            for (int i = 0; i < taxaIds.Length; i++)
            {
                if (taxaIds[i].Length > 0)
                {
                    // set the correct taxa for each item
                    result[i] = allTags.Where(c => taxaIds[i].Contains(c.Id)).ToArray();
                }
            }

            return result;
        }
    }

    public class SimpleTaxonModel
    {
        public Guid Id { get; set; }
        public string Title { get; set; }
    }
}