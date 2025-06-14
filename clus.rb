class Element
  attr_accessor :id, :data, :cluster_id, :is_centroid

  def initialize(id, data)
    @id = id
    @data = data
    @cluster_id = nil
    @is_centroid = false
  end
end

class Cluster
  attr_accessor :id, :elements, :centroid

  def initialize(id, element)
    @id = id
    @elements = [element]
    element.cluster_id = id
    element.is_centroid = true
    @centroid = element.data.dup
  end

  def update_centroid
    sum = Array.new(@centroid.length, 0.0)
    @elements.each do |e|
      e.data.each_with_index { |v, i| sum[i] += v }
    end
    @centroid = sum.map { |v| v / @elements.size }
  end
end

class Dataset
  attr_accessor :clusters, :elements, :next_id, :threshold

  def initialize(threshold = 5.0)
    @clusters = []
    @elements = []
    @next_id = 1
    @threshold = threshold
  end

  def distance(a, b)
    Math.sqrt(a.zip(b).map { |x, y| (x - y) ** 2 }.sum)
  end

  def insert(data)
    e = Element.new(@next_id, data)
    @elements << e
    @next_id += 1

    if @clusters.size < 2
      @clusters << Cluster.new(@clusters.size + 1, e)
      return
    end

    closest = @clusters.min_by { |c| distance(c.centroid, data) }
    closest.elements << e
    e.cluster_id = closest.id
    closest.update_centroid
    recalculate_all_centroids
    analyze_dispersion
  end

  def remove(id)
    e = @elements.find { |el| el.id == id }
    return unless e
    cluster = @clusters.find { |c| c.id == e.cluster_id }
    cluster.elements.delete(e)
    @elements.delete(e)
    cluster.update_centroid if cluster.elements.any?
  end

  def update(id, new_data)
    e = @elements.find { |el| el.id == id }
    return unless e
    e.data = new_data
    recalculate_all_centroids
  end

  def recalculate_all_centroids
    @clusters.each do |c|
      c.update_centroid
    end
  end

  def analyze_dispersion
    new_clusters = []
    @clusters.each do |cluster|
      distant = cluster.elements.select do |e|
        distance(e.data, cluster.centroid) > @threshold
      end

      distant.each do |e|
        cluster.elements.delete(e)
        other = @clusters.find { |c| c.id != cluster.id }
        if other && distance(e.data, other.centroid) < distance(e.data, cluster.centroid)
          other.elements << e
          e.cluster_id = other.id
        else
          new_cluster = Cluster.new(@clusters.map(&:id).max + 1, e)
          new_clusters << new_cluster
        end
      end
    end
    @clusters.concat(new_clusters)
    recalculate_all_centroids
  end

  def convert_categorical_to_numeric(data)
    @encodings ||= {}
    data.map.with_index do |val, i|
      if val.is_a?(String)
        @encodings[i] ||= {}
        @encodings[i][val] ||= @encodings[i].size.to_f
        @encodings[i][val]
      else
        val
      end
    end
  end
end

dataset = Dataset.new
dataset.insert([1.0, 2.0])
dataset.insert([2.0, 3.0])
dataset.insert([8.0, 9.0])
dataset.insert([1.5, 2.5])
dataset.insert([7.5, 8.5])

categorical_data = dataset.convert_categorical_to_numeric(["azul", "pequeno"])
dataset.insert(categorical_data)